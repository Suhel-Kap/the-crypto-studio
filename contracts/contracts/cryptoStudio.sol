// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/ITablelandController.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./utils/SQLHelpers.sol";

/*
CryptoStudio is builded to provide a completly dynamic NFT experience
Digital Artists can create their NFTs and think of unlimited ways to create
dynamic NFT experiences by leveraging tableland SQL utilities inside SmartContracts
*/

/** @title CryptoStudio a dynamic NFT Collection. */
/// @author Nick Lionis (github handle : nijoe1 )
/// @notice Use this contract for minting your NFTs inside the Crypto Studio application
/// @dev A new Dynamic NFTContract that takes The benefits of pure SQL dynamic features
/// Tableland offers mutable Data with immutable access control only by the SmartContract
/// All the data inside the tables are pointing to an IPFS CID.

contract CryptoStudio is ERC721
{


//  @@@@@@@   @@@@@@   @@@@@@@   @@@      @@@ ::::  @@@       @@@@@@   @@@       @@@  @@@@@@@     \\
//  @@@@@@@  @@@@@@@@  @@@@@@@@  @@@      @@@ ::::  @@@      @@@@@@@@  @@@::     @@@  @@@@@@@@    \\
//    @@@    @@!  @@@  @@@   @@  @@!      @@!       @@@      @@!  @@@  @@! ::    @@!  @@    @@@   \\
//    @@@    !@!  @!@  @@@   @@  !@!      !@!       @@@      !@!  @!@  !@!  ::   !@!  @@     @@@  \\
//    @@@    @!@!@!@!  @@@@@@@@  @!!      @!! ::::  @@@      @!@!@!@!  @!!   ::  @!!  @@     @@@  \\
//    @@@    !!!@!!!!  @@@@@@@@  !!!      !!! ::::  @@@      !!!@!!!!  !!!    :: !!!  @@     @@@  \\
//    @!@    !!:  !!!  @@@   @@  !!:      !!:       @@@      !!:  !!!  !!:     ::!!:  @@     @@@  \\
//    @@@    :!:  !:!  @@@   @@  :!:      :!:       @@@      :!:  !:!  :!:      :::!  @@    @@@   \\
//    @@@    ::   :::  @@@@@@@@  :: ::::  ::: ::::  @@@@@@@  ::   :::  ::        :::  @@   @@@    \\
//    @@@    ::   :::  @@@@@@@   :: ::::  ::: ::::  @@@@@@@   :   : :  ::         ::  @@@@@@@     \\
    
    using Counters for Counters.Counter;
    Counters.Counter private tokenID;
    address public owner;
    mapping(string => address) private spaceMap;

    ITablelandTables private tablelandContract;

    string  private _baseURIString;
    string private spaceTrait;
    uint256 private mintPrice;

    string  private mainTable;
    uint256 private mainTableID;
    string private constant MAIN_TABLE_PREFIX = "main";
    string private constant MAIN_SCHEMA = "tokenID text, description text, image text, audio text, name text, animation_url text";

    string  private attributeTable;
    uint256 private attributeTableID;
    string private constant ATTRIBUTE_TABLE_PREFIX = "attribute";
    string private constant ATTRIBUTE_SCHEMA = "tokenID text, trait_type text, value text";

    string  private space_table;
    uint256 private space_tableID;
    string private constant SPACE_TABLE_PREFIX = "space_group";
    string private constant SPACE_SCHEMA = "spaceName text, space_owner text, groupID text, image text";

    constructor() ERC721("CryptoStudio", "CS") 
    {
        owner = msg.sender;

        mintPrice = 0.01 ether;

        spaceTrait = "spaceName";
        // Creating the crypto Studio Tableland Tables on the constructor
        _baseURIString = "https://testnet.tableland.network/query?s=";

        tablelandContract = TablelandDeployments.get();

        // Create crypto Studio main nft table.
        mainTableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(MAIN_SCHEMA  , MAIN_TABLE_PREFIX)
        );

        mainTable = SQLHelpers.toNameFromId(MAIN_TABLE_PREFIX, mainTableID);
        // Create crypto Studio attribute nft table.
        attributeTableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(ATTRIBUTE_SCHEMA, ATTRIBUTE_TABLE_PREFIX)
        );

        attributeTable = SQLHelpers.toNameFromId(ATTRIBUTE_TABLE_PREFIX, attributeTableID);

        // Create crypto Studio social space table.
        space_tableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(SPACE_SCHEMA, SPACE_TABLE_PREFIX)
        );

        space_table = SQLHelpers.toNameFromId(SPACE_TABLE_PREFIX, space_tableID);

    }

    // Each digital artist must grap a SpaceName to start minting NFTs with trait_type = spaceName
    // Is like creating a space for digital artists to mint their NFTs.
    // A space can represent a whole collection of NFTs.

    /// @notice creation of a unique Space for a user. 
    /// This user is the only one that can mint NFTs
    /// with his spaceName as a unique attribute (trait_type)
    /// @dev retrieves the value of the spaceName and the created Orbis.group ID
    /// Then it stores this information inside the Space_Table
    /// @param spaceName the space to Mint
    /// @param space_group the spaceGroupID "where decentralized discord experiences begins"
    /// @param imageCID the spaceGroup image stored on IPFS


    function SocialSpaceCreation(string memory spaceName , string memory space_group , string memory imageCID) public  {
        require(spaceMap[spaceName] == address(0) , "taken space");
        spaceMap[spaceName] = msg.sender;
        string memory insert_statement =
        SQLHelpers.toInsert(
                SPACE_TABLE_PREFIX,
                space_tableID,
                "spaceName, space_owner, groupID, image",
                string.concat(
                    SQLHelpers.quote(spaceName),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(msg.sender)),
                    ",",
                    SQLHelpers.quote(space_group),
                    ",",
                    SQLHelpers.quote(imageCID)
                    
                )
        );
        runSQL(space_tableID,insert_statement);


    }

    /// @notice Returns true if a spaceName exists and false if it does not exists.
    /// @dev retrieves the value of the state variable `spaceName`
    /// @return the bool value
    function spaceExists(string memory spaceName) public view returns(bool){
        if(spaceMap[spaceName] == address(0)){
            return false;
        }
        return true;
    }

    /// @notice Minting function 
    /// @dev retrieves the values for the NFT that is going to be Minted.
    /// the caller must mint an NFT on top of his pre taken SpaceName otherwise he cannot mint
    function mint_your_Art(string memory name , string memory image , string memory animation , string memory audioCID, string memory description ,string memory spaceName) public payable {
        require(msg.value >= mintPrice , "Not enough ETH sent to mint: check price.");
        require(spaceMap[spaceName] == msg.sender, "anothorized space to mint");

        tokenID.increment();

        string memory insert_statement =
        SQLHelpers.toInsert(
                MAIN_TABLE_PREFIX,
                mainTableID,
                "tokenID, description, image, audio, name, animation_url",
                string.concat(
                    SQLHelpers.quote(Strings.toString(tokenID.current())),
                    ",",
                    SQLHelpers.quote(description),
                    ",",
                    SQLHelpers.quote(image),
                    ",",
                    SQLHelpers.quote(audioCID),
                    ",",
                    SQLHelpers.quote(name),
                    ",",
                    SQLHelpers.quote(animation)
                )
        );
        
         string memory insert_statement2 =
        SQLHelpers.toInsert(
                ATTRIBUTE_TABLE_PREFIX,
                attributeTableID,
                "tokenID, trait_type, value",
                string.concat(
                    SQLHelpers.quote((Strings.toString(tokenID.current()))),
                    ",",
                    SQLHelpers.quote(spaceTrait),
                    ",",
                    SQLHelpers.quote(spaceName)
                )
            );

        runSQL(mainTableID,insert_statement);
        runSQL(attributeTableID,insert_statement2);

        _safeMint(msg.sender, tokenID.current());

    }


    /// @notice changes the audioCID for an NFT dynamically 
    /// @dev retrieves the value of the tokenID and the new cid of the audio file
    /// Dynamically changes the NFT audio for a specific tokenID (nft)
    function changeNFTaudio(uint256 tokenid , string memory audioCID) public{
        require(_exists(tokenid) && ownerOf(tokenid) == msg.sender);
        string memory set = string.concat("audio='",audioCID,"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
        string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
        runSQL(mainTableID,Update_statement);
    }


    /// @notice dynamically add a trait attribute to the NFT only owners of that NFT can make that action
    /// @dev retrieves the value of the tokenID and the new trait type and the value of the new trait
    /// Dynamically add an attribute to the NFT with a specific tokenID
    function addAttribute(uint256 tokenid , string memory trait_type , string memory value) public {
        require(_exists(tokenid) && ownerOf(tokenid) == msg.sender);
        string memory insert_statement =
        SQLHelpers.toInsert(
                ATTRIBUTE_TABLE_PREFIX,
                attributeTableID,
                "tokenID, trait_type, value",
                string.concat(
                    SQLHelpers.quote((Strings.toString(tokenID.current()))),
                    ",",
                    SQLHelpers.quote(trait_type),
                    ",",
                    SQLHelpers.quote(value)
                )
            );
        runSQL(attributeTableID,insert_statement);
    } 


    /// @notice Function to dynamically update attributes to an NFT only owners of that NFT can make that ACTION
    /// Also the animation_url and the trait_type="spaceName" cannot change 
    /// @dev retrieves the value of the tokenID , the new attributeName , the value of the new attribute
    /// and a bool param
    /// Dynamically update an attribute to the NFT with a specific tokenID
    function updateAttribute(uint256 tokenid , string memory attributeName , string memory value, bool main_table) public {
        require(_exists(tokenid) && ownerOf(tokenid) == msg.sender);
        
        if(main_table){
            require(!(stringsEquals(attributeName,"animation_url")));
            string memory set = string.concat(attributeName,"='",value,"'");
            string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
            string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
            runSQL(mainTableID,Update_statement);
        }
        else{
            require(!(stringsEquals(attributeName,spaceTrait)));
            string memory set = string.concat("value='",value,"'");
            string memory filter = string.concat("tokenID=",Strings.toString(tokenid)," and trait_type='",attributeName,"'");
            string memory Update_statement = SQLHelpers.toUpdate(ATTRIBUTE_TABLE_PREFIX, attributeTableID, set, filter);
            runSQL(attributeTableID,Update_statement);
        }


    }     
 
    // Function to make Insertions , Updates and Deletions to our Tableland Tables 
    /// @notice Function to make Insertions , Updates and Deletions to our Tableland Tables 
    /// @dev retrieves the value of the tableID and the statement to execute on the table 
    function runSQL(uint256 tableID, string memory statement) private{
         tablelandContract.runSQL(
            address(this),
            tableID,
            statement        
        );
    }


    /// @notice Overriten tokenURI function to fit Tableland based NFTs
    /// @dev retrieves the value of the tokenID
    /// @return the tokenURI link for the specific NFT metadata
	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
		string memory baseURI = tableURI();
		
		string memory query = string(
			abi.encodePacked(
				'SELECT%20',
				'json_object%28%27tokenID%27%2C',
				mainTable,
				'%2EtokenID%2C%27name%27%2Cname%2C%27animation_url%27%2Canimation_url%2C%27description%27%2Cdescription%2C%27image%27%2Cimage%2C%27attributes%27%2Cjson_group_array%28json_object%28%27trait_type%27%2Ctrait_type%2C%27value%27%2Cvalue%29%29%29%20',
				'FROM%20',
				mainTable,
				'%20JOIN%20',
				attributeTable,
				'%20WHERE%20',
				mainTable,
				'%2EtokenID%20%3D%20',
				attributeTable,
				'%2EtokenID%20and%20',
				mainTable,
				'%2EtokenID%3D'
			)
		);
		return string(abi.encodePacked(baseURI, query, Strings.toString(tokenId), '&mode=list'));
	}

    /// @return of the tableland gateway prefix link 
    function tableURI() internal view returns (string memory) {
        return _baseURIString;
    }

    
    /// @notice Setting the tableland gateway prefix 
    /// @dev only for tableland updates
    function setTableURI(string memory baseURI) public  {
        require(msg.sender == owner, 'only owner can change the tableURI');
        _baseURIString = baseURI;
    }

    /// @dev returns the link to fetch all the data inside the main nft table
    function mainTableURI() 
    public view returns (string memory) {
        return string.concat(
            tableURI(), 
            "SELECT%20*%20FROM%20",
            mainTable
        );
    }       
    
    /// @dev returns the link to fetch all the data inside the attribute nft table
    function attributeTableURI() 
    public view returns (string memory) {
        return string.concat(
            tableURI(), 
            "SELECT%20*%20FROM%20",
            attributeTable
        );
    }  

    /// @dev returns the link to fetch all the spaces inside the space table
    function spaceTableURI() 
    public view returns (string memory) {
        return string.concat(
            tableURI(), 
            "SELECT%20*%20FROM%20",
            space_table
        );
    } 

    /// @dev Function to check if 2 on memory string are equal
    function stringsEquals(string memory s1, string memory s2) internal pure returns (bool) {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i=0; i<l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    /// @notice returns the total number of minted NFTs
    function totalSupply() public view returns (uint256){
        return tokenID.current();
    }    

    /// @notice withdraw function of the contract funds only by the contract owner
    function withdraw() public payable {
        require(msg.sender == owner, 'only owner can withdraw');
        address payable to = payable(msg.sender);
        to.transfer(address(this).balance);

  }
}