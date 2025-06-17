import React from 'react';
import { LanguageContext } from './LanguageContext';
import { PowerBIContent } from "./PowerBIContent";

// Query parameters
const searchParams = new URLSearchParams(document.location.search);

export class ReportContent extends React.Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        this.state = {
            reportId: null,
            datasetId: null,
            pageId: null,
            filters: null,
            pageNavigation: null,
            bookmarks: null,
            displayOption: null
        };
    }

    componentDidMount() {
        //Query parameters
        this.setState({
            reportId: searchParams.get('reportId'),
            datasetId: searchParams.get('datasetId'),
            pageId: searchParams.get('pageId'),
            filters: (searchParams.get('filters').toLowerCase() === "true"),
            pageNavigation: (searchParams.get('pageNavigation').toLowerCase() === "true"),
            bookmarks: (searchParams.get('bookmarks').toLowerCase() === "true"),
            displayOption: searchParams.get('displayOption')
        });
    }

    render() {
        const { reportId, datasetId, pageId, filters, pageNavigation, bookmarks, displayOption } = this.state;

        return (
            <div>
                <PowerBIContent
                    ReportId={reportId}
                    DatasetId={datasetId}
                    PageId={pageId}
                    Filters={filters}
                    PageNavigation={pageNavigation}
                    Bookmarks={bookmarks}
                    DisplayOption={displayOption}
                />
            </div>
        );
    }
}
