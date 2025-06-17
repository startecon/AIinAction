import React from "react";
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
    font-family: sans-serif;
  }
  *, :after, :before {
    box-sizing: inherit;
  }
`

const PageContent = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  max-width: 100vw;
  max-height: 100vh;
`
export const Page = (props) => (
    <PageContent
        onDrag={(e) => e.stopPropagation()}
        onDragEnd={(e) => e.stopPropagation()}
        onDragEnter={(e) => e.stopPropagation()}
        onDragExit={(e) => e.stopPropagation()}
        onDragLeave={(e) => e.stopPropagation()}
        onDragOver={(e) => e.stopPropagation()}
        onDragStart={(e) => e.stopPropagation()}
        onDrop={(e) => e.stopPropagation()}
    >
        {props.children}
        <GlobalStyle />
    </PageContent>
)