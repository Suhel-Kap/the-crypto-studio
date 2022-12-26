// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.11 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @dev Library of helpers for generating SQL statements from common parameters.
 */
library SQLHelpers {

    /**
     * @dev Generates a properly formatted table name from a prefix and table id.
     *
     * prefix - the user generated table prefix as a string
     * tableId - the Tableland generated tableId as a uint256
     *
     * Requirements:
     *
     * - block.chainid must refer to a supported chain.
     */
    function toNameFromId(string memory prefix, uint256 tableId)
        internal
        view
        returns (string memory)
    {
        return
            string.concat(
                    prefix,
                    "_",
                    Strings.toString(block.chainid),
                    "_",
                    Strings.toString(tableId)
                );
    }

    /**
     * @dev Generates a CREATE statement based on a desired schema and table prefix.
     *
     * schema - a comma seperated string indicating the desired prefix. Example: "int id, text name"
     * prefix - the user generated table prefix as a string
     *
     * Requirements:
     *
     * - block.chainid must refer to a supported chain.
     */
    function toCreateFromSchema(string memory schema, string memory prefix)
        internal
        view
        returns (string memory)
    {
        return
            string.concat(
                    "CREATE TABLE ",
                    prefix,
                    "_",
                    Strings.toString(block.chainid),
                    " (",
                    schema,
                    ");"
                );
    }

    /**
     * @dev Generates an INSERT statement based on table prefix, tableId, columns, and values.
     *
     * prefix - the user generated table prefix as a string.
     * tableId - the Tableland generated tableId as a uint256.
     * columns - a string encoded ordered list of columns that will be updated. Example: "name, age".
     * values - a string encoded ordered list of values that will be inserted wrapped in parentheses. Example: "'jerry', 24". Values order must match column order.
     *
     * Requirements:
     *
     * - block.chainid must refer to a supported chain.
     */
    function toInsert(
        string memory prefix,
        uint256 tableId,
        string memory columns,
        string memory values
    ) internal view returns (string memory) {
        string memory name = toNameFromId(prefix, tableId);
        return
            string.concat(
                    "INSERT INTO ",
                    name,
                    "(",
                    columns,
                    ")VALUES(",
                    values,
                    ")"
                );
    }

    /**
     * @dev Generates an Update statement based on table prefix, tableId, setters, and filters.
     *
     * prefix - the user generated table prefix as a string
     * tableId - the Tableland generated tableId as a uint256
     * setters - a string encoded set of updates. Example: "name='tom', age=26"
     * filters - a string encoded list of filters or "" for no filters. Example: "id<2 and name!='jerry'"
     *
     * Requirements:
     *
     * - block.chainid must refer to a supported chain.
     */
    function toUpdate(
        string memory prefix,
        uint256 tableId,
        string memory setters,
        string memory filters
    ) internal view returns (string memory) {
        string memory name = toNameFromId(prefix, tableId);
        string memory filter = "";
        if (bytes(filters).length > 0) {
            filter = string.concat(" WHERE ", filters);
        }
        return
            string.concat("UPDATE ", name, " SET ", setters, filter);
    }


    /**
     * @dev Add single quotes around a string value
     *
     * input - any input value.
     *
     */
    function quote(string memory input) internal pure returns (string memory) {
        return string.concat("'", input, "'");
    }

    function insertMainStatement(string memory MAIN_TABLE_PREFIX, uint256 mainTableID,uint256 tokenid ,string memory description, string memory imageCID,string memory name, string memory animationCID, uint256 maxSupply, uint256 mintPrice) internal view returns(string memory){
    return
    toInsert(
            MAIN_TABLE_PREFIX,
            mainTableID,
            "tokenID, description, image, name, audio, animation_url, maxSupply, currentSupply, mintPrice",
            string.concat(
                quote(Strings.toString(tokenid)),
                ",",
                quote(description),
                ",",
                quote(imageCID),
                ",",
                quote(name),
                ",",
                quote(animationCID),
                ",",
                quote(animationCID),
                ",",
                quote(Strings.toString(maxSupply)),
                ",",
                quote(Strings.toString(maxSupply)),
                ",",
                quote(Strings.toString(mintPrice))
            )
    );
    }

    function insertAttributeStatement(string memory ATTRIBUTE_TABLE_PREFIX, uint256 attributeTableID,uint256 tokenid ,string memory trait_type, string memory value) internal view returns(string memory){
        return  toInsert(
                ATTRIBUTE_TABLE_PREFIX,
                attributeTableID,
                "tokenID, trait_type, value",
                string.concat(
                    quote((Strings.toString(tokenid))),
                    ",",
                    quote(trait_type),
                    ",",
                    quote(value)
                )
            );
    }

    function addAttribute(string memory ATTRIBUTE_TABLE_PREFIX, uint256 attributeTableID, uint256 tokenid , string memory trait_type , string memory value) internal view returns(string memory) {
            return  toInsert(
            ATTRIBUTE_TABLE_PREFIX,
            attributeTableID,
            "tokenID, trait_type, value",
            string.concat(
                quote((Strings.toString(tokenid))),
                ",",
                quote(trait_type),
                ",",
                quote(value)
            )
        );
    }

    function spaceInsertion(string memory SPACE_TABLE_PREFIX, uint256 space_tableID, string memory  spaceName , string memory sender , string memory space_group, string memory imageCID) internal view returns(string memory){
        return toInsert(
            SPACE_TABLE_PREFIX,
            space_tableID,
            "spaceName, space_owner, groupID, image",
            string.concat(
                quote(spaceName),
                ",",
                quote(sender),
                ",",
                quote(space_group),
                ",",
                quote(imageCID)
                
            )
    );
    }

        //Is used to check if a string is equal to spaceName or creator 
    function allowedInput(string memory s1) internal pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes("spaceName");
        bytes memory b3 = bytes("creator");
        bool flag = false;
        bool flag2 = false;
        uint256 l1 = b1.length;
        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b3[i]){
                flag = true;
            } 
        }
        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b2[i]){
                flag2 = true;
            } 
        }
        if(flag && flag2){
            return true;
        }
        return false;
    }


}