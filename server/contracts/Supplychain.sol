// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2023 TrackGenesis Pvt. Ltd.

pragma solidity ^0.8.25;

contract Supplychain {
    address admin;

    constructor(address _admin) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized");
        _;
    }

    event AdminUpdated(address newAdmin);

    function updateAdmin(address newAdmin) public onlyAdmin {
        admin = newAdmin;
        emit AdminUpdated(newAdmin);
    }

     struct Product {
        string batchId;
        mapping(string => string) metaData;
    }

    mapping(string => Product) private products;
    mapping(string => string[]) private metaDataKeys;

     struct KeyValuePair {
        string key;
        string value;
    }

    function addProduct(
        string memory _uniqueId,
        string memory _batchId,
        KeyValuePair[] memory _metaData
    ) public onlyAdmin {
        // Validate input data
        require(bytes(_uniqueId).length > 0 &&  bytes(_batchId).length > 0, "Required fields are missing");

       
         Product storage newProduct = products[_uniqueId];
         newProduct.batchId=_batchId;

         uint256 metaDataLength = _metaData.length;
            for (uint256 i = 0; i < metaDataLength; i++) {
                 newProduct.metaData[_metaData[i].key] = _metaData[i].value;
                metaDataKeys[_uniqueId].push(_metaData[i].key);
            }
    }  

    function getProductDetails(string memory _uniqueId)
        public
        view
        returns (
            string memory,
            string memory,
            KeyValuePair[] memory
        )
        {
      
        Product storage product = products[_uniqueId];
        uint256 metaDataLength = metaDataKeys[_uniqueId].length;
        KeyValuePair[] memory metaData = new KeyValuePair[](
            metaDataLength
        );

        for (uint256 i = 0; i < metaDataLength; i++) {
            string memory key = metaDataKeys[_uniqueId][i];
            metaData[i] = KeyValuePair({
                key: key,
                value: product.metaData[key]
            });
        }
              
        return (_uniqueId,product.batchId, metaData);
    }
}