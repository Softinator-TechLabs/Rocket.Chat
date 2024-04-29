curl https://get.volta.sh | bash
volta install node@14.21.3
curl https://install.meteor.com/\?release\=2.15 | sh
corepack enable
git clone https://github.com/Softinator-TechLabs/Rocket.Chat.git
cd Rocket.Chat
git checkout 6.7.1
sudo su
export METEOR_ALLOW_SUPERUSER=true
wget https://raw.githubusercontent.com/RocketChat/Docker.Official.Image/master/6.7/Dockerfile
wget https://raw.githubusercontent.com/RocketChat/Docker.Official.Image/master/compose.yml 
#change image name

#-----------------------------------------------------------------------------
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
#-----------------------------------------------------------------------------

docker build -t softinator:chat .
docker compose up -d
#yarn
#yarn dsv
