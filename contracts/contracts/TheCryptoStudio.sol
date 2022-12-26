// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/ITablelandController.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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

contract TheCryptoStudio is ERC1155
{
    address private owner;
    
    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    struct spaceInfo{
        EnumerableSet.AddressSet spaceArtists;
        EnumerableSet.UintSet spaceTokens;
        address spaceAdmin;
    }

    struct tokenInfo{
        address creator;
        uint256 maxCap;
        uint256 price;
        bool changable;
    }

    Counters.Counter private tokenID;
    mapping(string => spaceInfo) private spaceInfoMap;
    mapping(uint256 => tokenInfo) private tokenInfoMap;
  
    ITablelandTables private tablelandContract;

    string  private _baseURIString;
    uint256 private spaceMintPrice;

    string  private mainTable;
    uint256 private mainTableID;
    string private constant MAIN_TABLE_PREFIX = "main";
    string private constant MAIN_SCHEMA = "tokenID text, description text, image text, name text, audio text, animation_url text, maxSupply text, currentSupply text, mintPrice text";

    string  private attributeTable;
    uint256 private attributeTableID;
    string private constant ATTRIBUTE_TABLE_PREFIX = "attribute";
    string private constant ATTRIBUTE_SCHEMA = "tokenID text, trait_type text, value text";

    string  private space_table;
    uint256 private space_tableID;
    string private constant SPACE_TABLE_PREFIX = "space_group";
    string private constant SPACE_SCHEMA = "spaceName text, space_owner text, groupID text, image text";

    constructor() ERC1155("") 
    {

        owner = msg.sender;

        spaceMintPrice = 0.01 ether;

        // Creating the crypto Studio Tableland Tables on the constructor
        _baseURIString = "https://testnets.tableland.network/query?s=";

        tablelandContract = TablelandDeployments.get();

        // Create crypto Studio main nft table.
        mainTableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(MAIN_SCHEMA, MAIN_TABLE_PREFIX)
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
    /// This user is the only one that can mint NFTs or Declare other space Artists to mint beside him
    /// with his spaceName as a unique attribute (trait_type)
    /// @dev retrieves the value of the spaceName and the created Orbis.group ID
    /// Then it stores this information inside the Space_Table
    /// @param spaceName the space to Mint
    /// @param space_group the spaceGroupID "where decentralized discord experiences begins"
    /// @param imageCID the spaceGroup image stored on IPFS

    function socialSpaceCreation(string memory spaceName , string memory space_group , string memory imageCID) public payable{
        require(msg.value >= spaceMintPrice);
        require(!spaceExists(spaceName));
        spaceInfoMap[spaceName].spaceAdmin = msg.sender;
        spaceInfoMap[spaceName].spaceArtists.add(msg.sender);
        string memory insert_statement = SQLHelpers.spaceInsertion( SPACE_TABLE_PREFIX,space_tableID,spaceName,Strings.toHexString(msg.sender),space_group,imageCID);
        runSQL(space_tableID,insert_statement);
    }

    /// @notice function to get if a spaceName is already exists
    function spaceExists(string memory spaceName)public view returns(bool){
        if(spaceInfoMap[spaceName].spaceAdmin == address(0)){
            return false;
        }
        return true;
    }

    /// @notice Declare NFT function 
    /// @dev retrieves the values for the NFT that is going to be Declared.
    /// the caller must be the spaceAdmin or a granted space artist by the space admin!
    function declareNFT(string memory name , string memory imageCID ,string memory audioCID , string memory animationCID , string memory description ,string memory spaceName, uint256 mintPrice, uint256 maxSupply,uint256 current) public   {
        require(spaceInfoMap[spaceName].spaceArtists.contains(msg.sender));
        require(current == tokenID.current()+1);
        tokenID.increment();
        spaceInfoMap[spaceName].spaceTokens.add(tokenID.current());
        tokenInfoMap[tokenID.current()].creator = msg.sender;
        tokenInfoMap[tokenID.current()].price = mintPrice;
        tokenInfoMap[tokenID.current()].maxCap = maxSupply;
        string memory insert_statement  =  SQLHelpers.insertMainStatement(MAIN_TABLE_PREFIX, mainTableID,tokenID.current(),description,imageCID,name,audioCID,animationCID,maxSupply,mintPrice);
        string memory insert_statement2 = SQLHelpers.insertAttributeStatement(ATTRIBUTE_TABLE_PREFIX, attributeTableID,tokenID.current() ,"spaceName", spaceName);
        string memory insert_statement3 = SQLHelpers.insertAttributeStatement(ATTRIBUTE_TABLE_PREFIX, attributeTableID,tokenID.current() ,"creator", Strings.toHexString(msg.sender));   
        runSQL(mainTableID,insert_statement);
        runSQL(attributeTableID,insert_statement2);
        runSQL(attributeTableID,insert_statement3);
    }

    /// @notice Mint Function each address needs to have a 0 balance of that NFT tokenID to mint it
    // Also each NFT has a defined number of copies and a certain price defined by the creator of that tokenID in the declareNFT function
    function mint(uint256 tokenid) public payable {
        exists(tokenid);
        require(tokenInfoMap[tokenid].maxCap > 0);
        require(tokenInfoMap[tokenid].price <= msg.value);
        require(balanceOf(msg.sender,tokenid) < 1);
        address payable to = payable(tokenInfoMap[tokenid].creator);
        to.transfer(msg.value);
        _mint(msg.sender, tokenid, 1, "");
        tokenInfoMap[tokenid].maxCap --;
        string memory set = string.concat("currentSupply='",Strings.toString(tokenInfoMap[tokenid].maxCap),"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
        string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
        runSQL(mainTableID,Update_statement);
    }

    /// @notice Function to change the mint price of a tokenID can only be called by the creator of the NFT
    function setTokenMintPrice(uint256 tokenid ,uint256 tokenPrice) public {
        onlyCreator(tokenid, msg.sender);
        isImmutable(tokenid);
        tokenInfoMap[tokenid].price = tokenPrice;
        string memory set = string.concat("mintPrice='",Strings.toString(tokenPrice),"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
        string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
        runSQL(mainTableID,Update_statement);
    }

    function setTokenToImmutable( uint256 tokenid) public {
        onlyCreator(tokenid,msg.sender);
        tokenInfoMap[tokenid].changable = true;
    }

    /// @notice dynamically add a trait attribute to the NFT only owners of that NFT can make that action
    /// @dev retrieves the value of the tokenID and the new trait type and the value of the new trait
    /// Dynamically add an attribute to the NFT with a specific tokenID
    function addAttribute(uint256 tokenid , string memory trait_type , string memory value) public {
        onlyCreator(tokenid, msg.sender);
        isImmutable(tokenid);
        string memory insert_statement = SQLHelpers.addAttribute(ATTRIBUTE_TABLE_PREFIX,attributeTableID,tokenid,trait_type,value);
        runSQL(attributeTableID,insert_statement);
    }

    /// @notice Function to dynamically update attributes to an NFT only the creator of that NFT can make that ACTION
    /// Also the animation_url and the trait_type="spaceName" cannot change that is checked by the allowedInput function
    /// @dev retrieves the value of the tokenID , the new attributeName , the value of the new attribute
    /// and a bool param
    /// Dynamically update an attribute to the NFT with a specific tokenID
    function updateAttribute(uint256 tokenid , string memory attributeName , string memory value) public {
        onlyCreator(tokenid, msg.sender);
        isImmutable(tokenid);
        require(SQLHelpers.allowedInput(attributeName));
        string memory set = string.concat("value='",value,"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid)," and trait_type='",attributeName,"'");
        string memory Update_statement = SQLHelpers.toUpdate(ATTRIBUTE_TABLE_PREFIX, attributeTableID, set, filter);
        runSQL(attributeTableID,Update_statement);
    }

    /// @notice NFTs with tokenType==true can change the animationURL only once this is happening to let the 
    // Artists - Designers to add as many attributes to their visualizers by fetching their value from the corresponding table 
    // and create the needed queries inside their animation scripts
    function updateAudio(uint256 tokenid , string memory audioCID) public {
        onlyCreator(tokenid, msg.sender);
        isImmutable(tokenid);
        string memory set = string.concat("audio","='",audioCID,"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
        string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
        runSQL(mainTableID,Update_statement);
    }     
  
    /// @notice The spaceOwner can hire others to join their Space and add their artistic touch by declaring more NFTs 
    function addSpaceArtist(string memory spaceName, address artist) public {
        onlySpaceAdmin(spaceName,msg.sender);
        spaceInfoMap[spaceName].spaceArtists.add(artist);
    }

    /// @notice The spaceOwner can remove not well behaved artists from te space
    function deleteSpaceArtist(string memory spaceName, address artist) public {
        onlySpaceAdmin(spaceName,msg.sender);
        spaceInfoMap[spaceName].spaceArtists.remove(artist);
    }

    /// @notice Function to check if an address isArtist inside a certain space
    // Is used for custom Lit Actions to encrypt content that only the spaceArtists can decrypt!
    function isSpaceArtist(string memory spaceName, address sender ) public view returns (bool){
        return spaceInfoMap[spaceName].spaceArtists.contains(sender);
    }

    /// @notice Function to check if an address isSpaceMember inside a certain space
    // Used for Lit Actions as the Encryption Rule for Posts-Proposal channels only granted to Space NFT holders , Artists and the space Admin
    function isSpaceMember(string memory spaceName, address sender) public view returns (bool){
        uint256 size = spaceInfoMap[spaceName].spaceTokens.length();
        uint256 index;
        if(isSpaceArtist(spaceName,sender)){
            return true;
        }
        for (uint256 i = 0; i < size; i++) {
            index = uint32(spaceInfoMap[spaceName].spaceTokens.at(i));
            if(balanceOf(sender,index) > 0){
                return true;
            }
        }
        return false;
    }

    /// @return of the tableland gateway prefix link 
    function tableURI() internal view returns (string memory) {
        return _baseURIString;
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

    /// @notice Setting the tableland gateway prefix 
    /// @dev only for tableland updates
    function setTableURI(string memory baseURI) public  {
         ownerCheck(msg.sender);
        _baseURIString = baseURI;
    }

    /// @notice Overriten URI function of the ERC1155 to fit Tableland based NFTs
    /// @dev retrieves the value of the tokenID
    /// @return the tokenURI link for the specific NFT metadata
	function uri(uint256 tokenId) public view virtual override returns (string memory) {
		exists(tokenId);
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
		return string(abi.encodePacked(tableURI(), query, Strings.toString(tokenId), '&mode=list'));
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

    /// @notice returns the total number of minted NFTs
    function totalSupply() public view returns (uint256){
        return tokenID.current();
    }    

    /// @notice withdraw function of the contract funds only by the contract owner
    function withdraw() public payable  {
        ownerCheck(msg.sender);
        address payable to = payable(msg.sender);
        to.transfer(address(this).balance);
    }

    function ownerCheck(address addr) internal view {
        if(owner!=addr){ revert(); }
    }

    function onlyCreator(uint256 tokenid, address sender) internal view {
        if(tokenInfoMap[tokenid].creator != sender){ revert(); }
    }

    function onlySpaceAdmin(string memory spaceName, address sender) internal view{
        if(spaceInfoMap[spaceName].spaceAdmin != sender){ revert(); }
    }

    function exists(uint256 tokenid) internal view{
        if(tokenid > tokenID.current()){ revert();}
    }

    function isImmutable(uint256 tokenid) internal view{
        if(tokenInfoMap[tokenid].changable == true) { revert(); }
    }


    function transferOwnership(address newOwner) public {
        ownerCheck(msg.sender);
        owner = newOwner;
    }
}
