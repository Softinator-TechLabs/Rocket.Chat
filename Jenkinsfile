pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'dockerhub-satyam'
        DOCKER_IMAGE = 'satyamv/custom'
        DOCKER_TAG = 'latest'
        DEPLOY_BRANCH = 'custom' // Change this to the desired branch
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${DEPLOY_BRANCH}", url: 'https://github.com/Softinator-TechLabs/Rocket.Chat.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
                        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}
