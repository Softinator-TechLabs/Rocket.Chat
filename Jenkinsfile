pipeline {
    agent {
        kubernetes {
            yaml """
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: kaniko
                image: gcr.io/kaniko-project/executor:latest
                args: ["--dockerfile=/workspace/Dockerfile", "--context=dir:///workspace/", "--destination=satyamv/rocket.chat:${env.BUILD_NUMBER}"]
                volumeMounts:
                - name: kaniko-secret
                  mountPath: /kaniko/.docker
              volumes:
              - name: kaniko-secret
                secret:
                  secretName: dockerhub-satyam
            """
        }
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image with Kaniko') {
            steps {
                container('kaniko') {
                    sh '/kaniko/executor'
                }
            }
        }

        stage('Update Compose File') {
            steps {
                script {
                    def composeFile = readFile('docker-compose.yml')
                    composeFile = composeFile.replaceAll(/\$\{TAG\}/, "${env.BUILD_NUMBER}")
                    writeFile file: 'docker-compose.yml', text: composeFile
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

