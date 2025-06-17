import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { CardHeader, CardRightContent, CardTitle, CardWrapper, Detail } from 'react-trello/dist/styles/Base'
import EditableLabel from 'react-trello/dist/widgets/EditableLabel'
import { AddButton, CancelButton } from 'react-trello/dist/styles/Elements'

export default class CustomNewCard extends Component {
    updateField = (field, value) => {
        this.setState({ [field]: value })
    }

    handleAdd = () => {
        this.props.onAdd(this.state)
    }

    render() {
        const { onCancel } = this.props
        return (
            <div style={{ background: '#E3E3E3' }}>
                <CardWrapper>
                    <CardHeader>
                        <CardTitle>
                            <EditableLabel placeholder="nimi" onChange={val => { this.updateField('nimi', val); this.updateField('tehtava_id', 1) }} autoFocus />
                        </CardTitle>
                    </CardHeader>
                    <CardHeader>
                        <CardTitle>
                            <EditableLabel placeholder="kotipaikka" onChange={val => this.updateField('kotipaikka', val)} autoFocus />
                        </CardTitle>
                    </CardHeader>
                    <CardHeader>
                        <CardTitle>
                            <EditableLabel placeholder="CV" onChange={val => this.updateField('CV', val)} autoFocus />
                        </CardTitle>
                    </CardHeader>
                    <CardHeader>
                        <CardTitle>
                            <EditableLabel placeholder="taito1" onChange={val => this.updateField('taito1', val)} autoFocus />
                        </CardTitle>
                        <CardTitle>
                            <EditableLabel placeholder="taito2" onChange={val => this.updateField('taito2', val)} autoFocus />
                        </CardTitle>
                        <CardTitle>
                            <EditableLabel placeholder="taito3" onChange={val => this.updateField('taito3', val)} autoFocus />
                        </CardTitle>
                    </CardHeader>
                </CardWrapper>
                <AddButton onClick={this.handleAdd}>Add</AddButton>
                <CancelButton onClick={onCancel}>Cancel</CancelButton>
            </div>
        )
    }
}

CustomNewCard.propTypes = {
    onCancel: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired
}
CustomNewCard.defaultProps = {}
