pipeline {
     agent any

    environment {
        DOCKER_CREDENTIALS = 'dockerhub-satyam'
        DOCKER_IMAGE = 'satyamv/custom'
        DOCKER_TAG = 'latest'
        DEPLOY_BRANCH = 'custom'
        DOCKER_HOST = 'tcp://192.168.4.78:2375' // Update 'host-ip' with your host server IP
    }

    stages {
        stage('Checkout') {
 	   steps {
        	script {
            // Define a larger timeout, e.g., 20 minutes
            	    def checkoutOptions = [
                        $class: 'GitSCM',
                        branches: [[name: '*/custom']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [[$class: 'CloneOption', depth: 1, timeout: 1200]],
                        userRemoteConfigs: [[url: 'https://github.com/Softinator-TechLabs/Rocket.Chat.git']]
            ]
            checkout(checkoutOptions)
	     }
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
