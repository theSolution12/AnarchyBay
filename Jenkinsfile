pipeline {
    agent any

    environment {
        // Your GitHub username or organization name, used to build the image URL
        GITHUB_OWNER = 'thesolution12'
        // FRONTEND_URL configures CORS on the backend. Since you are using a raw IP, replace this with your EC2 IP.
        FRONTEND_URL = 'http://15.206.182.3'
    }

    stages {
        stage('Deploy to EC2') {
            steps {
                // Securely load the backend .env file from Jenkins Credentials
                // Replace 'backend-env-file' with the ID of the Secret File you upload to Jenkins
                withCredentials([file(credentialsId: 'backend-env-file', variable: 'BACKEND_ENV')]) {
                    sh '''
                        echo "Deploying to EC2 via Docker Compose..."
                        
                        # Clean up any leftover .env from failed builds, then securely copy the new one
                        rm -f .env
                        cp $BACKEND_ENV .env
                        
                        # Export variables for docker-compose.prod.yml
                        export GITHUB_REPOSITORY_OWNER=${GITHUB_OWNER}
                        export FRONTEND_URL=${FRONTEND_URL}

                        # Note: If your GitHub repository is private, you will need to docker login to GHCR first:
                        # echo $GHCR_PAT | docker login ghcr.io -u $GITHUB_OWNER --password-stdin
                        
                        # Pull the latest images from GHCR
                        docker compose -f docker-compose.prod.yml pull
                        
                        # Restart the containers with the new images
                        docker compose -f docker-compose.prod.yml up -d
                        
                        # Clean up the .env file from the filesystem for security
                        rm .env
                        
                        echo "Deployment successful!"
                    '''
                }
            }
        }
    }
}
