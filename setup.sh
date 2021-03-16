#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

prerequisites() {
    echo "Checking all prerequisites ..."
    if [ -x "$(command -v docker)" ]; then
        echo "${green}docker is installed"
    else
        echo "${red}docker is missing. Please install docker. "
        echo "${reset}visit https://docs.docker.com/get-docker/"
        exit
    fi

    if [ -x "$(command -v node)" ]; then
        echo "${green}node is installed"
    else
        echo "${red}node is missing. Please install node"
        echo "${reset}visit https://nodejs.org/en/download/"
        exit
    fi

    if [ -x "$(command -v docker-compose)" ]; then
        echo "${green}Docker-Compose is installed"
    else
        echo "${red}docker-compose is missing. Please install docker-compose"
        echo "${reset}visit https://docs.docker.com/compose/install/"
        exit
    fi

    if [ -x "$(command -v jq)" ]; then
        echo "${green}jq is installed"
    else
        echo "${red}jq is missing. Please install jq"
        echo "${reset}visit https://stedolan.github.io/jq/download/"
        exit
    fi

    if [ -x "$(command -v curl)" ]; then
        echo "${green}curl is installed"
    else
        echo "${red}curl is missing. Please install curl"
        echo "${reset}visit https://curl.se/download.html"
        exit
    fi

    if [ -x "$(command -v git)" ]; then
        echo "${green}git is installed"
    else
        echo "${red}git is missing. Please install git"
        echo "${reset}https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"
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
        echo -n "${reset}Do you want to download the fabric-samples repo? yes/no "
        read answer
        if [ "$answer" == "yes" ] ;then
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
        elif [ "$answer" == "no" ] ;then
            echo "${red} Do not forget to setup environment variables."
        else
            echo "${red}Type yes or no"
            fabric_setup
        fi
    fi
}

start_network() {
    echo "${reset}Start fabric test-network"
    rm client/wallet/admin.id
    rm client/wallet/appUser.id
    cd ../fabric-samples/test-network
    ./network.sh down && ./network.sh up -ca
    if [ $? -eq 0 ]; then
        echo "${green}Fabric test-network started."
    else
        echo "${red}Fabric test-network failed to started."
        exit
    fi
    ./network.sh createChannel
    if [ $? -eq 0 ]; then
        echo "${green}mychannel joined by both orgs"
    else
        echo "${red}orgs failed to join mychannel"
        exit
    fi
}

install() {
    echo "${reset}Install cicero-contract chaincode on the network"
    cd ../../hlf-cicero-contract
    ./install.sh
    if [ $? -eq 0 ]; then
        echo "${green}Chaincode installed successfully"
    else
        echo "${red}Failed to install chaincode."
        exit
    fi
    echo "${green}Chaincode Installed"
}

prerequisites
fabric_setup
start_network
install