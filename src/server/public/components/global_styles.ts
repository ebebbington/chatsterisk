import { css } from "./deps.ts"

export const globalStyles = `
:root {
    --main-colour: white;
    --sub-colour: slategrey;
    --ter-colour: goldenrod;
}
body {
    text-align: center;
}
code {
    background: #e8e8e8;
    display: inline-block;
    margin-bottom: 0;
    padding-left: 0.18125rem;
    border-radius: 0.18125rem;
    padding-right: 0.18125rem;
    color: #e83e8c;
    word-break: break-word;
}
.text-align-c, .text-align-c * {
    text-align: center;
}
.margin-auto {
    margin: auto;
}
.container {
    height: 97vh;
    margin: auto;
    width: 98vw;
}
.row {
    margin: 1em;
}
.col-6 {
    width: 50%;
}
.hide {
    display: none;
}
.flex {
    display: flex;
}
@media screen and (min-width: 790px) {
    .container {
        width: 60vw;
    }
}
.error {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
    height: auto;
    padding: 2em;
    margin-top: 20vh;
}
ul {
    padding-left: 0;
}

#navbar {
    text-align: center;
    margin-bottom: 5em;
}
`;