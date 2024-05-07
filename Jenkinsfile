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
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS) {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                    }
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Ensure Docker Compose is installed on the host
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}
