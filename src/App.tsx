import React, { ChangeEvent, useState } from "react";
import { Alert, Button } from "antd";
import { Row, Col } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import AceEditor from "react-ace";
import { roman2unicode, UNICODE_BLOCKS } from "./utils/transliterate";
import convert, { Element } from "xml-js";
import "ace-builds/src-noconflict/mode-xml";
import FileReaderInput from "react-file-reader-input";

function trans(tag: Element, target: number): Element | undefined {
  const el = tag.elements && tag.elements.length > 0 && tag.elements[0];
  // @ts-ignore
  const tel = roman2unicode(el?.text, target);

  return {
    type: "element",
    name: `${tag.name}t`,
    elements: [
      {
        type: "text",
        text: tel,
      },
    ],
  };
}

function addTags(roman: string, target: number): string {
  const data = convert.xml2js(roman, { compact: false });
  const items = data?.elements[0]?.elements;

  for (let item of items || []) {
    const elements: Element[] = [];
    for (let tag of item.elements) {
      elements.push(tag);
      if (["mw", "pl", "ob"].includes(tag.name) && tag.elements?.length > 0) {
        const t = trans(tag, target);
        if (t) elements.push(t);
      } else if (tag.name === "mg") {
        const el2: Element[] = [];
        for (let tag2 of tag.elements) {
          el2.push(tag2);
          if (tag2.name === "tel") {
            const t = trans(tag2, target);
            if (t) el2.push(t);
          }
        }
        tag.elements = el2;
      }
    }
    item.elements = elements;
  }
  const res = convert.js2xml(data);
  return res.replaceAll("</hw>", "</hw>\n");
}

const App = () => {
  const [roman, setRoman] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [converted, setConverted] = useState<string>("");
  const [target] = useState(UNICODE_BLOCKS.telugu);

  const onFile = (event: ChangeEvent, results: FileReaderInput.Result[]) => {
    for (const [e] of results) {
      // @ts-ignore
      setRoman(e.target?.result);
    }
  };

  const doConvert = () => {
    setError("");
    try {
      setConverted(addTags(roman, target));
    } catch (e) {
      setError(e.message);
    }
  };

  const download = () => {
    const data = new Blob([converted], { type: "text/xml" });
    const url = window.URL.createObjectURL(data);
    const link = document.getElementById("download_link") as HTMLAnchorElement;
    link.download = "converted.xml";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Row>
        <Col span={8}>
          <FileReaderInput as="text" id="my-file-input" onChange={onFile}>
            <Button>Load XML File</Button>
          </FileReaderInput>
        </Col>
        <Col span={8}>
          <Button onClick={doConvert}>Convert</Button>
        </Col>
        <Col span={8}>
          {converted.length > 0 && <Button onClick={download}>Download</Button>}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a style={{ display: "none" }} id="download_link" href="#">
            download it
          </a>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {error.length > 0 && <Alert type="error" message={error} />}
        </Col>
      </Row>
      <Row className="height100">
        <Col span={12} className="height100">
          <AceEditor
            width="100%"
            height="90%"
            className="inputs"
            mode="xml"
            value={roman}
            onChange={setRoman}
          />
        </Col>
        <Col span={12}>
          <AceEditor
            mode="xml"
            width="100%"
            height="90%"
            readOnly
            value={converted}
          />
        </Col>
      </Row>
    </>
  );
};

export default App;
