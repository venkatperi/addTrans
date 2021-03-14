import React, { useState } from "react";
import { Alert, Button, Input, Select } from "antd";
import { Row, Col } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import { roman2unicode, UNICODE_BLOCKS } from "./utils/transliterate";

import convert from "xml-js";

const { TextArea } = Input;
const { Option } = Select;

const App = () => {
  const [roman, setRoman] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [converted, setConverted] = useState<string>("");
  const [target, setTarget] = useState(UNICODE_BLOCKS.telugu);

  return (
    <>
      <Row>
        <Col span={24}>
          <Button
            onClick={() => {
              setError("");
              try {
                const data = convert.xml2js(roman, { compact: false });
                const items = data.elements[0].elements;
                for (let item of items) {
                  for (let tag of item.elements) {
                    if (
                      ["mw", "pl", "ob"].includes(tag.name) &&
                      tag.elements?.length > 0
                    ) {
                      item.elements.push({
                        type: "element",
                        name: `${tag.name}t`,
                        elements: [
                          {
                            type: "text",
                            text: roman2unicode(tag.elements[0].text, target),
                          },
                        ],
                      });
                    }
                  }
                }

                console.log(items);
                setConverted(convert.js2xml(data, { spaces: 2 }));
              } catch (e) {
                setError(e.message);
              }
              // setConverted(roman2unicode(roman, target));
            }}
          >
            Convert
          </Button>
          {error.length && <Alert type="error" message={error} />}
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
