const router = require('express').Router();
const fs = require('fs');

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
const styleFormatter = {
    weight: "font-weight:REPLACEME;",
    SpaceAfter: "margin-bottom:REPLACEMEpx;",
    TextDecorationType: "text-decoration:REPLACEME;",
    TextAlign: "text-align:REPLACEME;",
    Placement: "display:REPLACEME;",
};
const Stack = [];
let HTML_Content = "";

const GetPathArray = (pathString) => {
    return pathString.split("/").splice(2);
};
const GetPath = (path) => {
    return path.split("[")[0];
};
const RemoveTill = (index) => {
    while (Stack.length > index) {
        const lastElement = Stack.pop();
        const fot = Formatter[GetPath(lastElement)]
        // console.log("lastElement Stack fot -> ", lastElement, '\t', Stack, '\t', fot);
        if (fot) {
            // console.log(fot);
            HTML_Content += `</${Formatter[GetPath(lastElement)]}>`;
        }
        // HTML_Content += `</${fot}>`;
    }
};
const ObjectToStyle = (elementStyleObject) => {
    let styleText = "";
    const keyList = Object.keys(elementStyleObject);
    keyList.map((key) => {
        if (styleFormatter[key]) {
            styleText += styleFormatter[key].replace("REPLACEME", elementStyleObject[key]);
        }
    });
    return styleText.toLowerCase();
};
const FormatElement = (element) => {
    const pathList = GetPathArray(element.Path);
    pathList.map((path, index) => {
        if (ignoreTags.includes(path) || (!element.Text && !element.Kids))
            return;

        const elementStyle = { ...element.Font, ...element.attributes };
        // Remove element
        if (Stack[index] !== path || (index + 1 === pathList.length && Stack.length > index)) {
            if (Stack[index] !== path) {
                RemoveTill(index);
            } else {
                RemoveTill(index + 1);
            }
        }

        // Insert new element
        if (Stack.length <= 0 || Stack.length <= index) {
            if (!skipTagBody.includes(GetPath(path))) {
                // const styy = ObjectToStyle(elementStyle);
                // console.log(`KelementStyle - ${styy}`);
                const actualpath = Formatter[GetPath(path)];
                if (ignoreStyle.includes(actualpath)) {
                    HTML_Content += `<${Formatter[GetPath(path)]}>`;
                } else {
                    HTML_Content += `<${Formatter[GetPath(path)]} style="${ObjectToStyle(elementStyle)}">`;
                }
            }
            Stack.push(path);
        }
        if (index + 1 === pathList.length && element.Kids) {
            element.Kids.map((ele) => {
                FormatElement(ele);
                // const KpathList = GetPathArray(ele.Path);
                // KpathList.map((Kpath, Kindex) => {
                //     if (ignoreTags.includes(Kpath) || (!ele.Text && !ele.Kids))
                //         return;
                //     const KelementStyle = { ...ele.Font, ...ele.attributes };
                //     if (Stack[Kindex] !== Kpath || (Kindex + 1 === KpathList.length && Stack.length > Kindex)) {
                //         if (Stack[Kindex] !== Kpath) {
                //             RemoveTill(Kindex);
                //         } else {
                //             RemoveTill(Kindex + 1);
                //         }
                //     }
                //     if (Stack.length <= 0 || Stack.length <= Kindex) {
                //         if (!skipTagBody.includes(GetPath(Kpath))) {
                //             HTML_Content += `<${Formatter[GetPath(Kpath)]} style="${ObjectToStyle(KelementStyle)}">`;
                //         }
                //         Stack.push(Kpath);
                //     }
                // });

                // if (!ignoreTags.includes(GetPath(KpathList[KpathList.length - 1])) && ele.Text) {
                //     HTML_Content += ele.Text;
                // }
            });
        }
    });
    if (!ignoreTags.includes(GetPath(pathList[pathList.length - 1])) && element.Text) {
        HTML_Content += element.Text;
    }
};


//#endregion Start JSONData

router.post("/", function (req, res) {
    HTML_Content = "";
    const { token, data } = req.body;
    try {
        if (token === 123) {
            data.elements.map((element) => {
                FormatElement(element);
            });
            RemoveTill(0);
            // fs.watchFile('index.html', HTML_Content, err => {
            //     if (err) {
            //         console.error(err);
            //     }
            // });
            console.log('request -', new Date());

            res.status(200).send(HTML_Content);
        } else {
            res.status(400).send("Invalid token");
            console.log('Invalid token');
        }
    } catch (error) {
        res.status(401).send("Something went wrong");
    }
});

module.exports = router