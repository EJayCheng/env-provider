import { existsSync, unlinkSync } from "fs";
import {
  array,
  bool,
  exportConfigMap,
  exportMarkdown,
  int,
  ints,
  json,
  Provider,
  str,
  strs,
} from "./index";

describe("str", () => {
  it("str 1", () => {
    process.env["STR_1"] = "1";
    expect(str("STR_1")).toEqual("1");
  });
  it("str a", () => {
    process.env["STR_1"] = "a";
    expect(str("STR_1")).toEqual("a");
  });
  it("str default", () => {
    expect(str("STR_DEFAULT", { defaultValue: "DEF" })).toEqual("DEF");
  });
});

describe("array", () => {
  it("array 1", () => {
    process.env["TEST_1"] = "1";
    process.env["TEST_2"] = "2";
    process.env["TEST_3"] = "3";
    expect(array("TEST")).toEqual(["1", "2", "3"]);
  });
  it("array 0", () => {
    process.env["TEST_0"] = "0";
    process.env["TEST_1"] = "1";
    process.env["TEST_2"] = "2";
    process.env["TEST_3"] = "3";
    expect(array("TEST")).toEqual(["0", "1", "2", "3"]);
  });
  it("array default", () => {
    expect(array("ARRAY_DEFAULT", { defaultValue: ["DEF"] })).toEqual(["DEF"]);
  });
});

describe("int", () => {
  it("int 1", () => {
    process.env["INT_1"] = "1";
    expect(int("INT_1")).toEqual(1);
  });
  it("int 0", () => {
    process.env["INT_0"] = "0";
    expect(int("INT_0")).toEqual(0);
  });
  it("int -1", () => {
    process.env["INT_N1"] = "-1";
    expect(int("INT_N1")).toEqual(-1);
  });
  it("int default", () => {
    expect(int("INT_DEFAULT", { defaultValue: 666 })).toEqual(666);
  });
});

describe("int", () => {
  it("int 1", () => {
    process.env["INT_1"] = "1";
    expect(int("INT_1")).toEqual(1);
  });
  it("int 0", () => {
    process.env["INT_0"] = "0";
    expect(int("INT_0")).toEqual(0);
  });
  it("int default", () => {
    expect(int("INT_DEFAULT", { defaultValue: 666 })).toEqual(666);
  });
});

describe("bool", () => {
  it("bool yes", () => {
    process.env["BOOL_YES"] = "yes";
    expect(bool("BOOL_YES")).toEqual(true);
  });
  it("bool YES", () => {
    process.env["BOOL_YES_"] = "YES";
    expect(bool("BOOL_YES_")).toEqual(true);
  });
  it("bool NO", () => {
    process.env["BOOL_NO"] = "NO";
    expect(bool("BOOL_NO")).toEqual(false);
  });
  it("bool default", () => {
    expect(bool("BOOL_DEFAULT", { defaultValue: true })).toEqual(true);
  });
});

describe("strs", () => {
  it("strs number", () => {
    process.env["STRS_NUMBER"] = "1,2,3,4,5";
    expect(strs("STRS_NUMBER")).toEqual(["1", "2", "3", "4", "5"]);
  });
  it("strs string", () => {
    process.env["STRS_STRING"] = "a,b,c,,d,5";
    expect(strs("STRS_STRING")).toEqual(["a", "b", "c", "d", "5"]);
  });

  it("strs default", () => {
    expect(strs("STRS_DEFAULT", { defaultValue: ["DEF"] })).toEqual(["DEF"]);
  });
});

describe("ints", () => {
  it("ints number", () => {
    process.env["INTS_NUMBER"] = "1,2,3,4,5";
    expect(ints("INTS_NUMBER")).toEqual([1, 2, 3, 4, 5]);
  });
  it("ints string", () => {
    process.env["INTS_STRING"] = "1,2,3,a,,5";
    expect(ints("INTS_STRING")).toEqual([1, 2, 3, 5]);
  });

  it("ints default", () => {
    expect(ints("INTS_DEFAULT", { defaultValue: [-1] })).toEqual([-1]);
  });
});

describe("json", () => {
  it("json number", () => {
    process.env["JSON_NUMBER"] = "1";
    expect(json("JSON_NUMBER")).toEqual(1);
  });
  it("json string", () => {
    process.env["JSON_STRING"] = '"123"';
    expect(json("JSON_STRING")).toEqual("123");
  });

  it("json json", () => {
    process.env["JSON_JSON"] = '{"abc":123}';
    expect(json("JSON_JSON")).toEqual({ abc: 123 });
  });

  it("json default", () => {
    expect(json("JSON_DEFAULT", { defaultValue: { test: 123 } })).toEqual({
      test: 123,
    });
  });
});

describe("provider", () => {
  it("is defined", () => {
    expect(
      Provider.json("PROVIDER_JSON", { defaultValue: "DEF" }).useFactory()
    ).toEqual("DEF");
    expect(
      Provider.bool("PROVIDER_BOOL", { defaultValue: true }).useFactory()
    ).toEqual(true);
    expect(
      Provider.str("PROVIDER_STR", { defaultValue: "DEF" }).useFactory()
    ).toEqual("DEF");
    expect(
      Provider.strs("PROVIDER_STRS", { defaultValue: ["DEF"] }).useFactory()
    ).toEqual(["DEF"]);
    expect(
      Provider.int("PROVIDER_INT", { defaultValue: 1 }).useFactory()
    ).toEqual(1);
    expect(
      Provider.ints("PROVIDER_INTS", { defaultValue: [1] }).useFactory()
    ).toEqual([1]);
    expect(
      Provider.array("PROVIDER_ARRAY", { defaultValue: ["DEF"] }).useFactory()
    ).toEqual(["DEF"]);
  });
});

describe("verifyEnvByConfig", () => {
  it("isRequired invalid", () => {
    expect(() => str("IS_REQUIRED", { isRequired: true })).toThrowError(Error);
  });

  it("int min invalid", () => {
    process.env["INT_MIN"] = "1";
    expect(() => int("INT_MIN", { min: 2 })).toThrowError(Error);
  });

  it("ints min invalid", () => {
    process.env["INTS_MIN"] = "2,1";
    expect(() => ints("INTS_MIN", { min: 2 })).toThrowError(Error);
  });

  it("ints min invalid 2", () => {
    process.env["INTS_MIN_2"] = "0,2,1";
    expect(() => ints("INTS_MIN_2", { min: 2 })).toThrowError(Error);
  });

  it("ints min valid", () => {
    process.env["INTS_MIN_OK"] = "1,2";
    expect(ints("INTS_MIN_OK", { min: 1 })).toEqual([1, 2]);
  });

  it("int max invalid", () => {
    process.env["INT_MAX"] = "3";
    expect(() => int("INT_MAX", { max: 2 })).toThrowError(Error);
  });

  it("ints max invalid", () => {
    process.env["INTS_MAX"] = "2,1,4";
    expect(() => ints("INTS_MAX", { max: 3 })).toThrowError(Error);
  });

  it("ints max invalid 2", () => {
    process.env["INTS_MAX_2"] = "3,0,1";
    expect(() => ints("INTS_MAX_2", { max: 2 })).toThrowError(Error);
  });

  it("ints max valid", () => {
    process.env["INTS_MAX_OK"] = "5,6";
    expect(ints("INTS_MAX_OK", { max: 6 })).toEqual([5, 6]);
  });

  it("str enum invalid", () => {
    process.env["STR_ENUM"] = "DEF";
    expect(() => str("STR_ENUM", { enum: ["TEST", "WTF"] })).toThrowError(
      Error
    );
  });

  it("str enum valid", () => {
    process.env["STR_ENUM_OK"] = "DEF";
    expect(str("STR_ENUM_OK", { enum: ["TEST", "WTF", "DEF"] })).toEqual("DEF");
  });

  it("int enum invalid", () => {
    process.env["INT_ENUM"] = "-1";
    expect(() => int("INT_ENUM", { enum: [1, 0] })).toThrowError(Error);
  });

  it("int enum valid", () => {
    process.env["INT_ENUM_OK"] = "-1";
    expect(int("INT_ENUM_OK", { enum: [1, 0, -1] })).toEqual(-1);
  });

  it("ints enum invalid", () => {
    process.env["INTS_ENUM"] = "1,-1,0";
    expect(() => ints("INTS_ENUM", { enum: [1, 0] })).toThrowError(Error);
  });

  it("regexp invalid", () => {
    process.env["STR_REGEXP"] = "D E F G";
    expect(() => str("STR_REGEXP", { regexp: /^d\se\sf$/i })).toThrowError(
      Error
    );
  });

  it("regexp valid", () => {
    process.env["STR_REGEXP_OK"] = "D E F";
    expect(str("STR_REGEXP_OK", { regexp: /^d\se\sf$/i })).toEqual("D E F");
  });

  it("strs regexp invalid", () => {
    process.env["STRS_REGEXP"] = "A1,AB,A2,A3";
    expect(() => strs("STRS_REGEXP", { regexp: /^A\d$/i })).toThrowError(Error);
  });

  it("minLength valid", () => {
    process.env["STR_MIN_LENGTH_OK"] = "DEF";
    expect(str("STR_MIN_LENGTH_OK", { minLength: 2 })).toEqual("DEF");
  });

  it("minLength invalid", () => {
    process.env["STR_MIN_LENGTH"] = "abcd";
    expect(() => str("STR_MIN_LENGTH", { minLength: 5 })).toThrowError(Error);
  });

  it("maxLength valid", () => {
    process.env["STR_MAX_LENGTH_OK"] = "DEF";
    expect(str("STR_MAX_LENGTH_OK", { maxLength: 4 })).toEqual("DEF");
  });

  it("maxLength invalid", () => {
    process.env["STR_MAX_LENGTH"] = "abcd56";
    expect(() => str("STR_MAX_LENGTH", { maxLength: 5 })).toThrowError(Error);
  });

  it("verifyFunction invalid", () => {
    process.env["STR_FUNCTION"] = "abcd56";
    expect(() =>
      str("STR_FUNCTION", { verifyFunction: () => false })
    ).toThrowError(Error);
  });

  it("verifyFunction invalid 2", () => {
    process.env["STR_FUNCTION_2"] = "abcd56";
    expect(() =>
      str("STR_FUNCTION_2", {
        verifyFunction: () => {
          throw new Error("TEST");
        },
      })
    ).toThrowError(Error);
  });
});

describe("output", () => {
  it("exportConfigMap", () => {
    const path = "./config-map.yml";
    exportConfigMap(path, "test", "test");
    expect(existsSync(path)).toBe(true);
    unlinkSync(path);
  });

  it("exportConfigMap", () => {
    const path = "./env.md";
    process.env["_MD"] = "DEFAULT";
    str("_MD", {
      description: "description",
      defaultValue: "TEST",
      isRequired: true,
    });
    exportMarkdown(path);
    expect(existsSync(path)).toBe(true);
    unlinkSync(path);
  });
});
