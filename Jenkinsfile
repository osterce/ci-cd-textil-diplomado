pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'mi-react-app'
        DOCKER_TAG = 'latest'
        CONTAINER_NAME = 'react-container'
    }

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Version control') {
            steps {
                git branch: "main", url:'https://github.com/osterce/ci-cd-textil-diplomado'
            }
        }
        stage('Install dependencies') {
            steps {
                sh "npm install"
            }
        }
        stage('Test') {
            steps {
                sh "npm run test"
            }
        }
        stage('Build') {
            steps {
                sh "npm run build"
            }
        }
        stage('Desplegar en Docker') {
            steps {
                script {
                    // Detener y eliminar contenedor si ya existe
                    sh '''
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker build -t ${DOCKER_IMAGE} .
                    docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${DOCKER_IMAGE}
                    '''
                }
            }
        }
    }
    post{
        failure{
            emailext(
                subject: "Project Name: ${JOB_NAME} - Pipeline Status: ${BUILD_NUMBER}",
                body: ''' <html>
                            <body>
                                <p>Build Status: ${BUILD_STATUS}</p>
                                <p>Build Number: ${BUILD_NUMBER}</p>
                                <p>Check the <a href="${BUILD_URL}">console output</a> to view the results.</p>
                            </body>
                        </html>''',
                to: 'osterce@gmail.com',
                from: 'ozterce84@gmail.com',
                mimeType: 'text/html'
            )
        }
    }
}