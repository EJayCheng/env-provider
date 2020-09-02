import { array } from "./index";

describe("env", () => {
  it("arrays", () => {
    process.env["TEST_1"] = "1";
    process.env["TEST_2"] = "2";
    process.env["TEST_3"] = "3";
    expect(array("TEST")).toEqual(["1", "2", "3"]);
  });
});
