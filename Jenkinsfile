pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-satyam')
        DOCKER_IMAGE_NAME = "satyamv/rocket.chat"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Image') {
            when {
                expression {
                    return env.DOCKERHUB_CREDENTIALS
                }
            }
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS) {
                        def image = docker.image("${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}")
                        image.push()
                    }
                }
            }
        }

        stage('Update Compose File') {
            steps {
                script {
                    // Update the docker-compose.yml file
                    def composeFile = readFile('docker-compose.yml')
                    composeFile = composeFile.replaceAll(/\$\{TAG\}/, "${env.BUILD_NUMBER}")
                    writeFile file: 'docker-compose.yml', text: composeFile
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Deploy the Docker image using Docker Compose
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

