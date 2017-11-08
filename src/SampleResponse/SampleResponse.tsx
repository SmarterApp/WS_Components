﻿import * as React from 'react';
import { Collapsible } from '../Rubric/Collapsible';
import * as AboutItemModels from '../AboutItem/AboutItemModels';

export class SampleResponse extends React.Component<AboutItemModels.SampleResponse, {}> {
    render() {
        const pointLabel = this.props.scorePoint == "1" ? "point" : "points";
        const label = `${this.props.name} (${this.props.scorePoint} ${pointLabel})`;
        return (
            <Collapsible label={label}>
                <div className="sample-response">
                    <b>Purpose: </b> {this.props.purpose} <br />
                    <b>Sample Response: </b> <br />
                    <div dangerouslySetInnerHTML={{ __html: this.props.sampleContent }} />
                </div>
            </Collapsible>
        );
    }
}