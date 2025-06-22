import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { withStyles } from '@mui/styles';

export const defaultSortColStyles = theme => ({
    root: {
        padding: '16px 24px 16px 24px',
        fontFamily: 'Roboto',
    },
    title: {
        marginLeft: '-7px',
        fontSize: '14px',
        color: theme.palette.text.secondary,
        textAlign: 'left',
        fontWeight: 500,
    },
    formGroup: {
        marginTop: '8px',
    },
    formControl: {},
    checkbox: {
        padding: '0px',
        width: '32px',
        height: '32px',
    },
    checkboxRoot: {
        '&$checked': {
            color: theme.palette.primary.main,
        },
    },
    checked: {},
    label: {
        fontSize: '15px',
        marginLeft: '8px',
        color: theme.palette.text.primary,
    },
});

class TableSortCol extends React.Component {
    constructor(props) {
        super(props)
    }

    static propTypes = {
        /** Columns used to describe table */
        columns: PropTypes.array.isRequired,
        /** Options used to describe table */
        options: PropTypes.object.isRequired,
        /** Callback to trigger View column update */
        onOrderChange: PropTypes.func,
        /** Extend the style applied to components */
        classes: PropTypes.object,
    };

    handleColChange = index => {
        this.props.onOrderChange(index);
    };

    render() {
        const { classes, columns } = this.props;
        const textLabels =  {
                title: 'Sort Columns',
                titleAria: 'Sort Table Columns'
        };
        // TODO Mui Button and styles
        return (
            <FormControl component={'fieldset'} className={classes.root} aria-label={textLabels.titleAria}>
                <Typography variant="caption" className={classes.title}>
                    {textLabels.title}
                </Typography>
                <FormGroup className={classes.formGroup}>
                    {columns.map((column, index) => {
                        return (
                            column.display !== 'excluded' &&
                            column.sortColumns !== false && (
                                <FormControlLabel
                                    key={index}
                                    classes={{
                                        root: classes.formControl,
                                        label: classes.label,
                                    }}
                                    control={
                                        <button
                                            className={classes.checkbox}
                                            classes={{
                                                root: classes.checkboxRoot,
                                                checked: classes.checked,
                                            }}
                                            onClick={this.handleColChange.bind(null, index)}
                                        >&#8593;</button>
                                        }
                                    label={(column.label || column.name)}
                                />
                            )
                        );
                    })}
                </FormGroup>
            </FormControl>
        );
    }
}

export default withStyles(defaultSortColStyles, { name: 'MUIDataTableSortCol' })(TableSortCol);