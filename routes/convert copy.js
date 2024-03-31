const router = require("express").Router();
const fs = require("fs");

//#region Start JSONData
const Formatter = {
  Document: "section",
  Sect: "section",
  Aside: "aside",
  Figure: "figure",
  Footnote: "footer",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
  P: "p",
  Reference: "a",
  ParagraphSpan: "p",
  StyleSpan: "span",
  Sub: "span",
  Span: "span",
  Table: "table",
  TD: "td",
  TH: "th",
  TR: "tr",
  Title: "h1",
  L: "ul",
  LI: "li",
  LBody: "",
  HyphenSpan: "span",
  Div: "div",
};
const skipTagBody = ["LBody"];
const ignoreTags = ["Watermark", "Lbl"];
const ignoreStyle = ["section"];
// TextPosition:"font-size:0.8rem;position:relative;",
const styleFormatter = {
  weight: "font-weight:REPLACEME;",
  TextDecorationType: "text-decoration:REPLACEME;",
  TextAlign: "text-align:REPLACEME;",
  Placement: "display:REPLACEME;",
  italic: "font-style:italic;",
};
// SpaceAfter: "margin-bottom:REPLACEMEpx;",
const ValueToStyle = {
  Sup: "font-size:0.75rem;position:relative;bottom:0.4rem;",
  Sub: "font-size:0.75rem;position:relative;top:0.4rem;",
};

const Stack = [];
let HTML_Content = "";
// const Footnotes = [];

const GetPathArray = (pathString) => {
  return pathString.split("/").splice(2);
};
const GetPath = (path) => {
  return path.split("[")[0];
};
const RemoveTill = (index) => {
  while (Stack.length > index) {
    const lastElement = Stack.pop();
    const TagInFormator = Formatter[GetPath(lastElement)];
    if (TagInFormator) {
      HTML_Content += `</${TagInFormator}>`;
    }
    // else{
    //     console.log('Not found', lastElement);
    // }
  }
};
const ObjectToStyle = (elementStyleObject) => {
  let styleText = "";
  const keyList = Object.keys(elementStyleObject);
  keyList.map((key) => {
    const _valueToStyle = ValueToStyle[elementStyleObject[key]];

    if (styleFormatter[key] && elementStyleObject[key]) {
      styleText += styleFormatter[key].replace(
        "REPLACEME",
        elementStyleObject[key]
      );
    } else if (elementStyleObject[key] && _valueToStyle) {
      styleText += _valueToStyle;
    }
  });
  return styleText.toLowerCase();
};
const FormatElement = (element) => {
  const pathList = GetPathArray(element.Path);
  pathList.map((path, index) => {
    if (ignoreTags.includes(path) || (!element.Text && !element.Kids)) return;

    const elementStyle = { ...element.Font, ...element.attributes };
    // Remove element
    if (
      Stack[index] !== path ||
      (index + 1 === pathList.length && Stack.length > index)
    ) {
      if (Stack[index] !== path) {
        RemoveTill(index);
      } else {
        RemoveTill(index + 1);
      }
    }

    // Insert new element
    if (Stack.length <= 0 || Stack.length <= index) {
      if (!skipTagBody.includes(GetPath(path))) {
        const actualpath = Formatter[GetPath(path)];
        if (actualpath) {
          if (ignoreStyle.includes(actualpath)) {
            HTML_Content += `<${actualpath}>`;
          } else {
            HTML_Content += `<${actualpath} style="${ObjectToStyle(
              elementStyle
            )}">`;
          }
        }
      }
      Stack.push(path);
    }
    if (index + 1 === pathList.length && element.Kids) {
      element.Kids.map((ele) => FormatElement(ele));
    }
  });
  if (
    !ignoreTags.includes(GetPath(pathList[pathList.length - 1])) &&
    element.Text
  ) {
    HTML_Content += element.Text;
  }
};

//#endregion Start JSONData
router.post("/", function (req, res) {
  HTML_Content = "";

  const { token, data } = req.body;
  try {
    
  } catch (error) {
    res.status(401).json({ message: "Something went wrong", error: error });
  }
});

module.exports = router;
