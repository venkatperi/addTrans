import React, { useState } from "react";
import { Alert, Button, Input } from "antd";
import { Row, Col } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import { roman2unicode, UNICODE_BLOCKS } from "./utils/transliterate";

import convert, { Element } from "xml-js";

const { TextArea } = Input;

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
  const items = data.elements[0].elements;

  for (let item of items) {
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
  return convert.js2xml(data, { spaces: 2 });
}

const App = () => {
  const [roman, setRoman] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [converted, setConverted] = useState<string>("");
  const [target] = useState(UNICODE_BLOCKS.telugu);

  return (
    <>
      <Row>
        <Col span={24}>
          <Button
            onClick={() => {
              setError("");
              try {
                setConverted(addTags(roman, target));
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Convert
          </Button>
          {error.length > 0 && <Alert type="error" message={error} />}
        </Col>
      </Row>
      <Row className="height100">
        <Col span={12} className="height100">
          <TextArea
            className="height100"
            onChange={(x) => setRoman(x.target.value)}
          />
        </Col>
        <Col span={12}>
          <TextArea className="height100" readOnly value={converted} />
        </Col>
      </Row>
    </>
  );
};

export default App;
