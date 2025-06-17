import React, { Component } from 'react';
import MUIDataTable from 'mui-datatables';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import cloneDeep from 'lodash.clonedeep';
import SortColButton from "./SortColButton";
import { authFetch, authPost } from '../authProvider';
import { LanguageContext } from './LanguageContext';
import ErrorDialog from './ErrorDialog'
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

var default_columns = [
    {
        label: "Id",
        name: "id",
        options: {
            filter: false
        }
    },
    {
        label: "NotCreated",
        name: "notCreated",
        options: {
            filter: true
        }
    },
    {
        label: "PublisherId",
        name: "publisherId",
        options: {
            filter: false
        }
    },
    {
        label: "OfferId",
        name: "offerId",
        options: {
            filter: false
        }
    },
    {
        label: "Name",
        name: "name",
        options: {
            filter: false
        }
    },
    {
        label: "SaasSubscriptionStatus",
        name: "saasSubscriptionStatus",
        options: {
            filter: true
        }
    },
    {
        label: "Beneficiary",
        name: "beneficiaryText",
        options: {
            filter: false
        }
    },
    {
        label: "Purchaser",
        name: "purchaserText",
        options: {
            filter: false
        }
    },
    {
        label: "PlanId",
        name: "planId",
        options: {
            filter: true
        }
    },
    {
        label: "Quantity",
        name: "quantity",
        options: {
            filter: false
        }
    },
    {
        label: "Term",
        name: "termText",
        options: {
            filter: false
        }
    },
    {
        label: "AutoRenew",
        name: "autoRenew",
        options: {
            filter: true
        }
    },
    {
        label: "IsTest",
        name: "isTest",
        options: {
            filter: true
        }
    },
    {
        label: "IsFreeTrial",
        name: "isFreeTrial",
        options: {
            filter: true
        }
    },
    {
        label: "AllowedCustomerOperations",
        name: "allowedCustomerOperationsText",
        options: {
            filter: false
        }
    },
    {
        label: "SessionId",
        name: "sessionId",
        options: {
            filter: false
        }
    },
    {
        label: "FulfillmentId",
        name: "fulfillmentId",
        options: {
            filter: false
        }
    },
    {
        label: "StoreFront",
        name: "storeFront",
        options: {
            filter: true
        }
    },
    {
        label: "SandboxType",
        name: "sandboxType",
        options: {
            filter: true
        }
    },
    {
        label: "Created",
        name: "created",
        options: {
            filter: false
        }
    },
    {
        label: "SessionMode",
        name: "sessionMode",
        options: {
            filter: true
        }
    },
    {
        label: "TenantId",
        name: "tenantId",
        options: {
            filter: true
        }
    }
];

/* Perusmuuttujat ja vakiot */
const PROFIILI_GET = 'api/Profiili/Read';
const PROFIILI_PUT = 'api/Profiili/Update';

/* Näkymäkohtaiset muuttujat ja vakiot */
const API_PREFIX = 'api/Marketplace/Subscription';


var items = [];
var selectedRows = [];
var rowId;

/* Luokka */
export class AdminMarketplace extends Component {
    static contextType = LanguageContext;

    constructor(props) {
        super(props);

        // State alustukset
        this.state = {
            loading: true,
            multiple: false,
            hidden: [],
            rowNum: 0,
            errorShow: false,
            errorTitle: '',
            errorBody: '',
            rowsSelected: [],
        };

        //Bindit
        this.swapCols = this.swapCols.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    }

    componentDidMount() {

        //Items
        authFetch(this.props.pca, API_PREFIX + '/Read')
            .then(response => response.json())
            .then(data => {
                items = Array.isArray((data || {}).subscriptions) ? data.subscriptions : [];

                for (var i = 0; i < items.length; i++) {
                    items[i].purchaserText = items[i].purchaser.emailId;
                    items[i].tenantId = items[i].beneficiary.tenantId;
                    items[i].beneficiaryText = items[i].beneficiary.emailId;
                    items[i].termText = items[i].term.startDate + "-" + items[i].term.endDate;
                    items[i].allowedCustomerOperationsText = JSON.stringify(items[i].allowedCustomerOperations);
                    items[i].notCreated = ((data.subsInDb || []).filter(d => d.id == items[i].id).length == 0 ? 1 : 0);
                }

                //Profiili
                authFetch(this.props.pca, PROFIILI_GET)
                    .then(response => response.json())
                    .then(data => {
                        // ordering
                        var cols = (((JSON.parse(data.uI_Settings) || {}).columns || {}).marketplace || []);
                        if (cols.length > 0) cols = JSON.parse(cols);
                        else cols = null;

                        // hidden cols
                        var hidden_cols = (((JSON.parse(data.uI_Settings) || {}).hiddencolumns || {}).marketplace || []);
                        if (hidden_cols.length > 0) hidden_cols = JSON.parse(hidden_cols);
                        else hidden_cols = null;

                        // rowNum
                        var rowNum = (((JSON.parse(data.uI_Settings) || {}).rownum || {}).marketplace || []);
                        if (rowNum.length > 0) rowNum = JSON.parse(rowNum);
                        else rowNum = 20;

                        var columns = get_ordered_columns(cols, hidden_cols);

                        this.setState({
                            columns: columns,
                            data: items,
                            loading: false,
                            rowNum: rowNum
                        });
                    });
            });
    }


    swapCols = (index) => {
        if (index > 1) {
            var cols = cloneDeep(this.state.columns);
            var d = this.state.data;
            [cols[index - 1], cols[index]] = [cols[index], cols[index - 1]];
            this.setState({ columns: cols });
            var setting = { "key": "columns.marketplace", "value": JSON.stringify(cols.map(function (d) { return d.name; })).split('"').join('""') };
            authPost(this.props.pca, PROFIILI_PUT, {
                method: 'PUT',
                body: JSON.stringify(setting)
            });
        }
    };

    changeRownum = (num) => {
        this.setState({ rowNum: num })

        var setting = { "key": "rownum.marketplace", "value": JSON.stringify(num).split('"').join('""') };
        authPost(this.props.pca, PROFIILI_PUT, {
            method: 'PUT',
            body: JSON.stringify(setting)
        })
    };

    hiddenCols = (changedColumn, action) => {
        var cols = cloneDeep(this.state.columns);
        var hidden = [];

        for (var i = 0; i < cols.length; i++) {
            if (!(cols[i].options))
                cols[i].options = {};

            if (cols[i].name == changedColumn)
                cols[i].options.display = (action === "add" ? true : false)

            if (cols[i].options.display == false) {
                hidden.push(cols[i].name);
            }
        }

        if (action === "add") {
            hidden.splice(hidden.indexOf(changedColumn), 1);
        }
        else if (action === "remove") {
            hidden.push(changedColumn);
        }

        this.setState({ columns: cols });
        var setting = { "key": "hiddencolumns.marketplace", "value": (hidden.length > 0 ? JSON.stringify(hidden).split('"').join('""') : "[]") }; // TODO: muuta avain
        authPost(this.props.pca, PROFIILI_PUT, {
            method: 'PUT',
            body: JSON.stringify(setting)
        })
    };

    handleError = (error) => {
        var title = '', body = ''
        if (error == 4) {
            title = this.context.dictionary.ErrorDialog.Error4.title;
            body = this.context.dictionary.ErrorDialog.Error4.body;
        } else if (error == 5) {
            title = this.context.dictionary.ErrorDialog.Error5.title;
            body = this.context.dictionary.ErrorDialog.Error5.body;
        } else {
            title = this.context.dictionary.ErrorDialog.Error.title;
            body = this.context.dictionary.ErrorDialog.Error.body;
        }
        this.setState({
            errorShow: true,
            errorTitle: title,
            errorBody: body
        })
    }

    handleErrorClose = () => this.setState({ errorShow: false });

    addNewItem = (newrow) => {
        // ADD
        var data = cloneDeep(this.state.data);
        data = data.concat(newrow);
        authPost(this.props.pca, API_PREFIX + '/Create', {
            body: JSON.stringify(newrow)
        }).then(res => {
            if (res.status == 200) {
                authFetch(this.props.pca, API_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({ data: data })
                    });
            }
        });
        this.setState({ data: data });
    }

    editItem = (newrow) => {
        // EDIT
        var data = cloneDeep(this.state.data);
        authPost(this.props.pca, API_PREFIX + '/Update', {
            method: 'PUT',
            body: JSON.stringify(newrow)
        }).then(res => {
            if (res.status == 200) {
                authFetch(this.props.pca, API_PREFIX + '/Read')
                    .then(response => response.json())
                    .then(data => {
                        this.setState({ data: data })
                    });
            }
        });
        this.setState({ data: data });
    }

    onRowSelectionChange = (_, allRows) => {
        this.setState({ rowsSelected: allRows.map(row => row.index) });
    };

    render() {
        const { userLanguage, dictionary } = this.context;
        const { errorShow, errorTitle, errorBody } = this.state;

        var cols = cloneDeep(this.state.columns);
        if ((cols || []).length > 0) {
            for (var i = 0; i < default_columns.length; i++) {
                for (var j = 0; j < cols.length; j++) {
                    if (cols[j].label == default_columns[i].label) {
                        cols[j].label = dictionary.AdminMarketplace.Columns[i]
                    }
                }
            }
        }

        var options = {

            textLabels: dictionary.DataTableLabels,
            selectableRowsHeader: true,
            selectableRowsOnClick: true,
            selectableRows: "multiple",
            filterType: 'multiselect',
            responsive: "standard",
            jumpToPage: true,
            rowsPerPage: this.state.rowNum,
            rowsPerPageOptions: [10, 20, 50, 80, 100, 150],
            rowsSelected: this.state.rowsSelected,
            onChangeRowsPerPage: (num) => {
                this.changeRownum(num);
            },
            onViewColumnsChange: (changedColumn, action) => {
                this.hiddenCols(changedColumn, action);
            },
            onRowSelectionChange: (currentRowsSelected, allRows, rowsSelected) => {
                const { data } = this.state;
                rowId = null;
                if (rowsSelected.length > 0) {
                    rowId = data[rowsSelected[0]].id; //TODO: Muuta avain
                }
                this.setState({ rowsSelected: rowsSelected });
            },
            // Huomioi samat arvot ja sen jölkeen lajitellaan ensimmäisen sarakkeen (id) mukaan
            customSort: (data, colIndex, order) => {
                const { columns, lookupLists } = this.state;

                return data.sort((a, b) => {
                    if (a.data[colIndex] == b.data[colIndex]) {
                        // samanarvoisissa riveissä otetaan riviavainjärjestys
                        return ((a.data[0] || -9e6) < (b.data[0] || -9e6) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    } else if (columns[colIndex].options.lookuplist) {
                        // lookuplist lajittelu
                        const list = lookupLists[columns[colIndex].options.lookuplist];
                        var aa = (list[a.data[colIndex]] || ''), bb = (list[b.data[colIndex]] || '');

                        return ((parseInt(!/[^0-9]/i.test(aa) ? aa : 'x') || aa.toString()) < (parseInt(!/[^0-9]/i.test(bb) ? bb : 'x') || bb.toString()) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    } else {
                        // normaali lajittelu
                        return ((a.data[colIndex] || -9e6) < (b.data[colIndex] || -9e6) ? -1 : 1) * (order === 'desc' ? 1 : -1);
                    }
                });
            },

            customToolbarSelect: (selRows, displayData, setSelectedRows) => {
                const { data } = this.state;

                if ((selRows.data || []).length > 0) {
                    selectedRows = selRows.data.map(d => (d.dataIndex));
                    rowId = data[selectedRows[0]].id; //TODO: Muuta avain
                }

                var handleDelete = () => {
                    var data = cloneDeep(this.state.data);

                    if (window.confirm(dictionary.AdminMarketplace.Confirmation1 + selectedRows.map(d => data[d].id).join(", "))) { //TODO: Muuta avain
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Delete/' + data[selectedRows[i]].id, { method: 'delete' }) //TODO: Muuta avain
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                setSelectedRows([]);
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        items = Array.isArray((data || {}).subscriptions) ? data.subscriptions : [];

                                        for (var i = 0; i < items.length; i++) {
                                            items[i].purchaserText = items[i].purchaser.emailId;
                                            items[i].tenantId = items[i].beneficiary.tenantId;
                                            items[i].beneficiaryText = items[i].beneficiary.emailId;
                                            items[i].termText = items[i].term.startDate + "-" + items[i].term.endDate;
                                            items[i].allowedCustomerOperationsText = JSON.stringify(items[i].allowedCustomerOperations);
                                            items[i].notCreated = ((data.subsInDb || []).filter(d => d.Id == items[i].Id).length == 0);
                                        }
                                        this.setState({ data: items, rowsSelected: [] })
                                    });
                            });
                    }
                }

                var handleCreate = () => {
                    const { data } = this.state;
                    if (window.confirm(dictionary.AdminMarketplace.Confirmation2 + selectedRows.map(d => data[d].id).join(", "))) {
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            const row = data[selectedRows[i]];
                            requests.push(
                                authPost(this.props.pca, API_PREFIX + '/Create', { body: JSON.stringify(row) })
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        items = Array.isArray((data || {}).subscriptions) ? data.subscriptions : [];

                                        for (var i = 0; i < items.length; i++) {
                                            items[i].purchaserText = items[i].purchaser.emailId;
                                            items[i].tenantId = items[i].beneficiary.tenantId;
                                            items[i].beneficiaryText = items[i].beneficiary.emailId;
                                            items[i].termText = items[i].term.startDate + "-" + items[i].term.endDate;
                                            items[i].allowedCustomerOperationsText = JSON.stringify(items[i].allowedCustomerOperations);
                                            items[i].notCreated = ((data.subsInDb || []).filter(d => d.Id == items[i].Id).length == 0);
                                        }
                                        this.setState({ data: items, rowsSelected: [] })
                                    });
                            });
                    }
                }

                var handleActivate = () => {
                    const { data } = this.state;
                    if (window.confirm(dictionary.AdminMarketplace.Confirmation2 + selectedRows.map(d => data[d].id).join(", "))) {
                        var requests = []
                        for (var i = 0; i < selectedRows.length; i++) {
                            const row = data[selectedRows[i]];
                            requests.push(
                                authFetch(this.props.pca, API_PREFIX + '/Activate/' + (row.id || '') + '/' + (row.planId || ''))
                                    .then(response => response.json())
                            );
                        }
                        Promise.all(requests)
                            .then(() => {
                                authFetch(this.props.pca, API_PREFIX + '/Read')
                                    .then(response => response.json())
                                    .then(data => {
                                        items = Array.isArray((data || {}).subscriptions) ? data.subscriptions : [];

                                        for (var i = 0; i < items.length; i++) {
                                            items[i].purchaserText = items[i].purchaser.emailId;
                                            items[i].tenantId = items[i].beneficiary.tenantId;
                                            items[i].beneficiaryText = items[i].beneficiary.emailId;
                                            items[i].termText = items[i].term.startDate + "-" + items[i].term.endDate;
                                            items[i].allowedCustomerOperationsText = JSON.stringify(items[i].allowedCustomerOperations);
                                            items[i].notCreated = ((data.subsInDb || []).filter(d => d.Id == items[i].Id).length == 0);
                                        }
                                        this.setState({ data: items, rowsSelected: [] })
                                    });
                            });
                    }
                }

                // TODO: Edit kohtaan oma toiminto
                return (
                    <div className={"custom-toolbar-select"}>
                        {(selectedRows.length < 2) ? (
                            <React.Fragment>
                                <Tooltip title={dictionary.Toolbar.CreateAccount}>
                                    <IconButton onClick={handleCreate}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={dictionary.Toolbar.Activate}>
                                    <IconButton onClick={handleActivate}>
                                        <MonetizationOnIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={dictionary.Toolbar.Delete}>
                                    <IconButton onClick={handleDelete}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Tooltip title={dictionary.Toolbar.CreateAccount}>
                                    <IconButton onClick={handleCreate}>
                                        <AddCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={dictionary.Toolbar.Activate}>
                                    <IconButton onClick={handleActivate}>
                                        <MonetizationOnIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={dictionary.Toolbar.Delete}>
                                    <IconButton onClick={handleDelete}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        )}
                    </div>
                );
            },
            customToolbar: () => {
                return (
                    <React.Fragment>
                        <SortColButton columns={cols} onOrderChange={this.swapCols} />
                    </React.Fragment>
                );
            }
        };
        return (
            <div style={{ padding: "10px" }}>
                {(this.state.loading) ? (
                    <CircularProgress />
                ) : (
                    <MUIDataTable
                        title={dictionary.Toolbar.title}
                        data={this.state.data}
                        columns={cols}
                        options={options}
                    />
                )
                }
                <ErrorDialog open={errorShow} title={errorTitle} body={errorBody} onClose={this.handleErrorClose} />
            </div>
        );
    }
}

function get_ordered_columns(list, hidden) {
    var columns = [];

    if (!Array.isArray(list)) {
        list = default_columns.map((c) => (c.name));
    }

    list.forEach(function (el) {
        columns.push((default_columns.filter(function (d) { return d.name == el; }) || [])[0]);
        if (hidden != null) {
            if (!(columns[columns.length - 1].options))
                columns[columns.length - 1].options = {};
            if (hidden.indexOf(columns[columns.length - 1].name) > -1) {
                columns[columns.length - 1].options.display = false;
            } else {
                columns[columns.length - 1].options.display = true;
            }
        }
    });

    return columns;
}