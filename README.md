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
docker build -t softinator:chat .
wget https://raw.githubusercontent.com/RocketChat/Docker.Official.Image/master/compose.yml 
#change image name
yarn
yarn dsv
