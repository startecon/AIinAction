import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { withStyles } from "@mui/styles";
import TableSortCol from "./TableSortCol";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import Popover from './Popover';
import { LanguageContext } from './LanguageContext';

const defaultToolbarStyles = {
    iconButton: {
    },
};

class SortColButton extends React.Component {
    static contextType = LanguageContext;
    constructor(props) {
        super(props)
    }

    setActiveIcon = iconName => {
        this.setState(() => ({
            showSearch: true,
            iconActive: iconName
        }));
    };

    // TODO Icon and texts
    render() {
        const { userLanguage, dictionary } = this.context;
        return (
            <React.Fragment>
                <Popover
                    refExit={this.setActiveIcon.bind(null)}
                    trigger={
                        <Tooltip title={dictionary.SortColButton} disableFocusListener>
                            <IconButton className={this.props.classes.iconButton}
                                onClick={this.setActiveIcon.bind(null, 'viewcolumns')}>
                                <CompareArrowsIcon />
                            </IconButton>
                        </Tooltip>
                    }
                    content={
                        <TableSortCol columns={this.props.columns} onOrderChange={this.props.onOrderChange} />
                    }
                />
            </React.Fragment>
        );
    }
}

export default withStyles(defaultToolbarStyles, { name: "SortColButton" })(SortColButton);
