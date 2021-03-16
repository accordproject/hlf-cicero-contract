cd ..
export HLF_INSTALL_DIR=$(readlink -f fabric-samples/)
export PATH=$(readlink -f fabric-samples)/bin/:$PATH
cd hlf-cicero-contract