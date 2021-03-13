#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

prerequisites() {
    echo "Checking all prerequisites ..."
    if [ -x "$(command -v docker)" ]; then
        echo "${green}docker is installed"
    else
        echo "${red}docker is missing. Please install docker"
        exit
    fi

    if [ -x "$(command -v node)" ]; then
        echo "${green}node is installed"
    else
        echo "${red}node is missing. Please install node"
        exit
    fi

    if [ -x "$(command -v docker-compose)" ]; then
        echo "${green}Docker-Compose is installed"
    else
        echo "${red}docker-compose is missing. Please install docker-compose"
        exit
    fi

    if [ -x "$(command -v jq)" ]; then
        echo "${green}jq is installed"
    else
        echo "${red}jq is missing. Please install jq"
        exit
    fi

    if [ -x "$(command -v curl)" ]; then
        echo "${green}curl is installed"
    else
        echo "${red}curl is missing. Please install curl"
        exit
    fi

    if [ -x "$(command -v git)" ]; then
        echo "${green}git is installed"
    else
        echo "${red}git is missing. Please install git"
        exit
    fi
}

fabric_setup() {
    echo "${reset}Check for Hyperledger Fabric"
    if [ -d "../fabric-samples" ] 
    then
        echo "${green}fabric-sample is present"
        export HLF_INSTALL_DIR=$(readlink -f ../fabric-samples)
        export PATH=$(readlink -f ../fabric-samples)/bin/:$PATH
        echo "${green}environment variables set successfully." 
    else
        echo "Installing fabric-samples ..."
        cd ..
        curl -sSL https://bit.ly/2ysbOFE | bash -s
        export HLF_INSTALL_DIR=$(readlink -f fabric-samples/)
        export PATH=$(readlink -f fabric-samples)/bin/:$PATH
        if [ -x "$(command -v peer)" ]; then
            echo "${green}PATH to peer binary is set"
            cd hlf-cicero-contract
        else
            echo "${red}failed to set PATH for peer binary"
            exit
        fi
        echo "${reset}fabric-samples repo downloaded"
    fi
}

start_network() {
    echo "${reset}Start fabric test-network"
    rm client/wallet/admin.id
    rm client/wallet/appUser.id
    cd ../fabric-samples/test-network
    ./network.sh down && ./network.sh up -ca
    ./network.sh createChannel
    echo "${green}Fabric test-network started."
}

install() {
    echo "${reset}Install cicero-contract chaincode on the network"
    cd ../../hlf-cicero-contract
    ./install.sh
    echo "${green}Chaincode Installed"
}

initialize() {
    echo "${reset}Initialize cicero-contract chaincode on the network"
    ./initialize.sh
    echo "${green}Chaincode Initialized"
}

trigger() {
    echo "${reset}Trigger chaincode installed on the network"
    ./trigger.sh
    echo "${green}Chaincode Triggered"
}

prerequisites
fabric_setup
start_network
install
sleep 10s
initialize
trigger