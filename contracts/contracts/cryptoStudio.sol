// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";
import "@tableland/evm/contracts/ITablelandController.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./utils/SQLHelpers.sol";

contract cryptoStudio is ERC721
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
   
    ITablelandTables private tablelandContract;

    string  private _baseURIString;

    string  private mainTable;
    uint256 private mainTableID;
    string private constant MAIN_TABLE_PREFIX = "main";
    string private constant MAIN_SCHEMA = "tokenID text, description text, image text, audio text, name text, animation_url text";

    string  private spacesTable;
    uint256 private spacesTableID;
    string private constant SPACES_TABLE_PREFIX = "spaces";
    string private constant SPACE_SCHEMA = "tokenID text, trait_type text, value text, creatorAddress text";

    constructor() ERC721("CryptoStudio", "CS") 
    {

        // Creating the M3taDao Tableland Tables on the constructor
        _baseURIString = "https://testnet.tableland.network/query?s=";

        tablelandContract = TablelandDeployments.get();

        // Create m3tadao organizations table.
        mainTableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(MAIN_SCHEMA  , MAIN_TABLE_PREFIX)
        );

        mainTable = SQLHelpers.toNameFromId(MAIN_TABLE_PREFIX, mainTableID);
        // Create m3tadao users profile table.
        spacesTableID = tablelandContract.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(SPACE_SCHEMA, SPACES_TABLE_PREFIX)
        );

        spacesTable = SQLHelpers.toNameFromId(SPACES_TABLE_PREFIX, spacesTableID);

    }

    function mint_your_Art(string memory name , string memory image , string memory animation , string memory audioCID, string memory description ,string memory spaceName) public payable {

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
                SPACES_TABLE_PREFIX,
                spacesTableID,
                "tokenID, trait_type, value, creatorAddress",
                string.concat(
                    SQLHelpers.quote((Strings.toString(tokenID.current()))),
                    ",",
                    SQLHelpers.quote("spaceName"),
                    ",",
                    SQLHelpers.quote(spaceName),
                    ",",
                    SQLHelpers.quote(Strings.toHexString(msg.sender))
                )
            );

        runSQL(mainTableID,insert_statement);
        runSQL(spacesTableID,insert_statement2);

        _safeMint(msg.sender, tokenID.current());

    }

    function changeNFTaudio(uint256 tokenid , string memory audioCID) public{
        require(_exists(tokenid) && ownerOf(tokenid) == msg.sender);
        string memory set = string.concat("audio='",audioCID,"'");
        string memory filter = string.concat("tokenID=",Strings.toString(tokenid));
        string memory Update_statement = SQLHelpers.toUpdate(MAIN_TABLE_PREFIX, mainTableID, set, filter);
        runSQL(mainTableID,Update_statement);

    }       
 
    // Function to make Insertions , Updates and Deletions to our Tableland Tables 
    function runSQL(uint256 tableID, string memory statement) private{
         tablelandContract.runSQL(
            address(this),
            tableID,
            statement        
        );
    }
 

	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
		string memory baseURI = _TABLEbaseURI();
		
		string memory query = string(
			abi.encodePacked(
				'SELECT%20',
				'json_object%28%27tokenID%27%2C',
				mainTable,
				'%2EtokenID%2C%27name%27%2Cname%2C%27animation_url%27%2Canimation_url%2C%27description%27%2Cdescription%2C%27image%27%2Cimage%2C%27attributes%27%2Cjson_group_array%28json_object%28%27trait_type%27%2Ctrait_type%2C%27value%27%2Cvalue%29%29%29%20',
				'FROM%20',
				mainTable,
				'%20JOIN%20',
				spacesTable,
				'%20WHERE%20',
				mainTable,
				'%2EtokenID%20%3D%20',
				spacesTable,
				'%2EtokenID%20and%20',
				mainTable,
				'%2EtokenID%3D'
			)
		);
		return string(abi.encodePacked(baseURI, query, Strings.toString(tokenId), '&mode=list'));
	}

    function _TABLEbaseURI() internal view returns (string memory) {
        return _baseURIString;
    }
    // Setting tableland BaseUri for future updates!!!
    function setTABLEBaseURI(string memory baseURI) public  {
        _baseURIString = baseURI;
    }

    function NFT_STUDIO_TableURI() 
    public view returns (string memory) {
        return string.concat(
            _baseURI(), 
            "SELECT%20*%20FROM%20",
            mainTable
        );
    }       
    
    function SPACES_TableURI() 
    public view returns (string memory) {
        return string.concat(
            _baseURI(), 
            "SELECT%20*%20FROM%20",
            spacesTable
        );
    }  

    function totalSupply() public view returns (uint256){
        return tokenID.current();
    }    
}