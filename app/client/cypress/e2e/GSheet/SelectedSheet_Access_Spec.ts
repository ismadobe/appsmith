/// <reference types="Cypress" />
import { GSHEET_DATA } from "../../fixtures/test-data-gsheet";
import {
  homePage,
  gsheetHelper,
  dataSources,
  agHelper,
  entityExplorer,
} from "../../support/Objects/ObjectsCore";

const workspaceName = "gsheet apps";
const dataSourceName = "gsheet-selected";
let appName = "gsheet-app";
let spreadSheetName = "test-sheet-automation-selected";
describe("GSheet-Functional Tests With Selected Access", function () {
  before("Setup app", function () {
    //Setting up app name
    const uuid = Cypress._.random(0, 10000);
    appName = appName + "-" + uuid;

    //Adding app
    homePage.NavigateToHome();
    homePage.CreateAppInWorkspace(workspaceName);
    homePage.RenameApplication(appName);
  });

  it("1. Add and verify fetch details query", () => {
    entityExplorer.CreateNewDsQuery(dataSourceName);
    agHelper.RenameWithInPane("Fetch_Details");
    dataSources.ValidateNSelectDropdown(
      "Operation",
      "Fetch Many",
      "Fetch Details",
    );
    dataSources.ValidateNSelectDropdown("Entity", "Spreadsheet");
    agHelper.Sleep(500);
    dataSources.ValidateNSelectDropdown("Spreadsheet", "", spreadSheetName);
    dataSources.RunQuery();
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body.name).to.deep.equal(
        spreadSheetName,
      );
    });
  });

  it("2. Verify Insert One and Insert Many queries", () => {
    // add insert one query and verify
    gsheetHelper.AddInsertOrUpdateQuery(
      "Insert One",
      dataSourceName,
      spreadSheetName,
      JSON.stringify(GSHEET_DATA[0]),
    );
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body.message).to.deep.equal(
        "Inserted row successfully!",
      );
    });

    // add insert many query and verify
    gsheetHelper.AddInsertOrUpdateQuery(
      "Insert Many",
      dataSourceName,
      spreadSheetName,
      JSON.stringify(GSHEET_DATA.slice(1, 10)),
    );
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body.message).to.deep.equal(
        "Inserted rows successfully!",
      );
    });
  });

  it("3. Verify Update one and Update many queries", () => {
    // add update one query and verify
    gsheetHelper.AddInsertOrUpdateQuery(
      "Update One",
      dataSourceName,
      spreadSheetName,
      JSON.stringify(GSHEET_DATA[1]),
    );
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body.message).to.deep.equal(
        "Updated sheet successfully!",
      );
    });

    // add update many query and verify
    gsheetHelper.AddInsertOrUpdateQuery(
      "Update Many",
      dataSourceName,
      spreadSheetName,
      JSON.stringify(GSHEET_DATA.slice(2, 4)),
    );
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body.message).to.deep.equal(
        "Updated sheet successfully!",
      );
    });
  });

  it("4. Verify Fetch many query", () => {
    // Add simple Fetch many query and verify
    gsheetHelper.EnterBasicQueryValues(
      "Fetch Many",
      dataSourceName,
      spreadSheetName,
    );
    dataSources.RunQueryNVerifyResponseViews(GSHEET_DATA.length);
    dataSources.AssertQueryTableResponse(0, GSHEET_DATA[0].uniq_id);
    dataSources.AssertQueryTableResponse(1, "ホーンビィ 2014 カタログ"); // Asserting other language
    dataSources.AssertQueryTableResponse(2, "₹, $, €, ¥, £"); // Asserting different symbols
    dataSources.AssertQueryTableResponse(3, "!@#$%^&*"); // Asserting special chars

    // Update query to fetch only 1 column and verify
    gsheetHelper.SelectMultiDropDownValue("Columns", "product_name");
    dataSources.RunQuery();
    dataSources.RunQueryNVerifyResponseViews(GSHEET_DATA.length);
    dataSources.AssertQueryTableResponse(0, GSHEET_DATA[0].product_name);

    //Remove column filter and add Sort By Ascending and verify
    gsheetHelper.SelectMultiDropDownValue("Columns", "product_name"); //unselect the Columns dd value
    agHelper.EnterValue("price", {
      propFieldName: "",
      directInput: false,
      inputFieldName: "Sort By",
    });
    dataSources.RunQueryNVerifyResponseViews(GSHEET_DATA.length);
    dataSources.AssertQueryTableResponse(0, "5afbaf65680c9f378af5b3a3ae22427e");
    dataSources.AssertQueryTableResponse(
      1,
      "ラーニング カーブ チャギントン インタラクティブ チャッツワース",
    ); // Asserting other language
    dataSources.AssertQueryTableResponse(2, "₹, $, €, ¥, £"); // Asserting different symbols
    dataSources.AssertQueryTableResponse(3, "!@#$%^&*"); // Asserting special chars

    // Sort by descending and verify
    dataSources.ClearSortByOption(); //clearing previous sort option
    dataSources.EnterSortByValues("price", "Descending");
    dataSources.RunQuery();
    dataSources.RunQueryNVerifyResponseViews(GSHEET_DATA.length);
    dataSources.AssertQueryTableResponse(
      1,
      "ホーンビー ゲージ ウェスタン エクスプレス デジタル トレイン セット (eLink および TTS ロコ トレイン セット付き)",
    ); // Asserting other language
    dataSources.AssertQueryTableResponse(
      4,
      "Hornby Gauge Western Express Digital Train Set with eLink and TTS Loco Train Set",
    );

    // Filter by where clause and verify
    agHelper.TypeDynamicInputValueNValidate(
      "price",
      dataSources._nestedWhereClauseKey(0),
    );
    agHelper.TypeDynamicInputValueNValidate(
      "100",
      dataSources._nestedWhereClauseValue(0),
    );
    dataSources.RunQuery();
    dataSources.RunQueryNVerifyResponseViews(8);
    dataSources.AssertQueryTableResponse(0, "87bbb472ef9d90dcef140a551665c929");

    // Currently commenting this until https://github.com/appsmithorg/appsmith/issues/25447 is fixed.
    // Filter by cell range and verify
    // dataSources.ValidateNSelectDropdown(
    //   "Filter Format",
    //   "Where Clause",
    //   "Cell range",
    // );
    // agHelper.EnterValue("A2:A5", {
    //   propFieldName: "",
    //   directInput: false,
    //   inputFieldName: "Cell range",
    // });
    // dataSources.RunQuery();
    // dataSources.RunQueryNVerifyResponseViews(8);
    // dataSources.AssertQueryTableResponse(0, "eac7efa5dbd3d667f26eb3d3ab504464");
  });

  it("5. Update a record which is not present and verify the error", () => {
    //preparing data
    const data = GSHEET_DATA[1];
    data.rowIndex = "15";

    // add update one query and verify
    gsheetHelper.EnterBasicQueryValues(
      "Update One",
      dataSourceName,
      spreadSheetName,
      false,
    );
    agHelper.EnterValue(JSON.stringify(data), {
      propFieldName: "",
      directInput: false,
      inputFieldName: "Update row object",
    });
    dataSources.RunQuery({
      expectedStatus: false,
    });
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body).to.deep.equal(
        "No data found at this row index.",
      );
    });

    //reset the row index
    data.rowIndex = "1";
  });

  it("6. Convert field to JS and verify", () => {
    // Switch js on sheet name then run query and verify
    gsheetHelper.EnterBasicQueryValues(
      "Fetch Many",
      dataSourceName,
      spreadSheetName,
      false,
    );
    agHelper.GetNClick(
      dataSources._getJSONswitchLocator("Sheet name"),
      0,
      true,
    );
    dataSources.RunQueryNVerifyResponseViews(10);
    dataSources.AssertQueryTableResponse(0, "eac7efa5dbd3d667f26eb3d3ab504464");

    //Enter a wrong sheet name then run query and verify
    agHelper.EnterValue("Sheet 2", {
      propFieldName: "",
      directInput: false,
      inputFieldName: "Sheet name",
    });
    dataSources.RunQuery({
      expectedStatus: false,
    });
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body).to.deep.equal(
        "Unable to parse range: 'Sheet 2'!1:1",
      );
    });

    //Covert sheet name field to dropdown then run query and verify
    agHelper.HoverElement(dataSources._getJSONswitchLocator("Sheet name"));
    agHelper.AssertTooltip("Clear the field to toggle back");
    agHelper.EnterValue("", {
      propFieldName: "",
      directInput: false,
      inputFieldName: "Sheet name",
    }); //Clearing the sheet name field
    agHelper.GetNClick(
      dataSources._getJSONswitchLocator("Sheet name"),
      0,
      true,
    ); // Converting the field to dropdown
    dataSources.ValidateNSelectDropdown("Sheet name", "", "Sheet1");
    dataSources.RunQueryNVerifyResponseViews(10);
    dataSources.AssertQueryTableResponse(0, "eac7efa5dbd3d667f26eb3d3ab504464");
  });

  it("7. Verify Delete query", function () {
    // Delete spreadsheet and app
    gsheetHelper.EnterBasicQueryValues(
      "Delete One",
      dataSourceName,
      spreadSheetName,
    );
    GSHEET_DATA.reverse().forEach((d) => {
      agHelper.EnterValue(d.rowIndex, {
        propFieldName: "",
        directInput: false,
        inputFieldName: "Row Index",
      });
      dataSources.RunQuery();
      cy.get("@postExecute").then((interception: any) => {
        expect(interception.response.body.data.body.message).to.deep.equal(
          "Deleted row successfully!",
        );
      });
      agHelper.Sleep(500);
    });
    // Fetch many to verify all the data is deleted
    gsheetHelper.EnterBasicQueryValues(
      "Fetch Many",
      dataSourceName,
      spreadSheetName,
      false,
    );
    dataSources.RunQuery();
    cy.get("@postExecute").then((interception: any) => {
      expect(interception.response.body.data.body).to.deep.equal([]);
    });
  });

  after("Delete app", function () {
    // Delete app
    homePage.NavigateToHome();
    homePage.DeleteApplication(appName);
  });
});
