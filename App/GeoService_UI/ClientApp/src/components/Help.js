import React from 'react';
import { Content, Page, Sidebar, Navi } from './MarkdownViewer'
import Paper from '@mui/material/Paper';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

import { authFetch, authPost } from "./../authProvider";

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Markdown';

const headers = (props) => {
    const { level, children } = props;
    const heading = children[0];
    var anchor = (typeof heading === 'string') ? heading.toLowerCase() : '';
    anchor = anchor.replace(/ä/g, 'a');
    anchor = anchor.replace(/ö/g, 'o');
    anchor = anchor.replace(/[^a-zA-Z0-9 ]/g, '');
    anchor = anchor.replace(/ /g, '-');
    return (<div id={anchor}>
        {level == 1 ? (<h1>{children}</h1>) :
            level == 2 ? (<h2>{children}</h2>) :
                level == 3 ? (<h3>{children}</h3>) :
                    (<h4>{children}</h4>)}
    </div>);
}

export class Help extends React.Component {
    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            selected: null,
            loading: true
        };

        //Bindit
        //this.swapCols = this.swapCols.bind(this);
        //this.addNewItem = this.addNewItem.bind(this);
    }

    componentDidMount() {
        authFetch(this.props.pca, API_PREFIX + '/Index')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    structure: data,
                    markdown: null,
                    loading: false
                }, () => {
                    this.handleSelect(null, 'index.md');
                });
            });
    }

    handleSelect = (event, value) => {
        authPost(this.props.pca, API_PREFIX + '/Read', {
            body: JSON.stringify({ path: value })
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    markdown: data,
                    selected: value
                });
            });
    }

    handleHashLink = (event, value) => {
        authPost(this.props.pca, API_PREFIX + '/Read', {
            body: JSON.stringify({ path: value })
        })
            .then(response => response.text())
            .then(data => {
                this.setState({
                    markdown: data
                });
            });
    }

    render() {
        return (
            <React.Fragment>
                {(this.state.loading) ? (
                    <CircularProgress />
                ) : (
                    <Page>
                        <Sidebar>
                            <Paper elevation={3} style={{ padding: 20, overflowY: 'auto' }}>
                                    <Navi treeItems={this.state.structure} onSelect={this.handleSelect} Selected={this.state.selected} />
                            </Paper>
                        </Sidebar>
                        <Content className={"help-content"}>
                            <ReactMarkdown
                                children={this.state.markdown}
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    a: (props) => {
                                        return props.href.startsWith('http') ?
                                            (<a target="_blank" href={props.href}>{props.children}</a>) : // External links
                                            props.href.startsWith('#') ?
                                                (<Link
                                                    component="button"
                                                    variant="subtitle1"
                                                    onClick={() => {
                                                        const el = document.getElementById(props.href.slice(1))
                                                        if (el) el.scrollIntoView();
                                                    }}
                                                >
                                                    {props.children}
                                                </Link>) : // Same page links
                                                (<Link
                                                    component="button"
                                                    variant="subtitle1"
                                                    onClick={() => {
                                                        this.handleSelect(null, props.href);
                                                    }}
                                                >
                                                    {props.children}
                                                </Link>);  // Render internal links with Link component

                                    },
                                    img: (props) => {
                                        const src = (props.src.indexOf('ClientApp/public') > -1 ? props.src.substring(props.src.indexOf('ClientApp/public') + 16) : props.src);
                                        return (
                                            <img src={src} style={{ maxHeight: "100%", maxWidth: "100%" }} alt={props.alt} />
                                        );
                                    },
                                    h1: headers,
                                    h2: headers,
                                    h3: headers,
                                    h4: headers
                                }}
                            />
                        </Content>
                    </Page>
                )
                }
            </React.Fragment>
        );
    }
}
