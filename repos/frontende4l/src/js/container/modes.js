import React from "react";
import { Button, Container } from 'react-bootstrap';
import Switch from "react-switch";
import { fetchRateLimiterStatus,toggleRateLimiter } from "../action/seminarAction";
import { connect } from "react-redux";
import { Redirect } from 'react-router-dom';
import Select from "react-select";

@connect((store) => {
    return {
        seminarReducer: store.seminarReducer,
    }
})
export class Modes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.props.dispatch(fetchRateLimiterStatus());
    }


    toggleRateLimiter = async (checked) => {
                 this.props.dispatch(toggleRateLimiter(checked));
    }

    render() {
        return (
            <Container>
                <h3>Rate Limiter:</h3>
                <Switch
                    onChange={this.toggleRateLimiter}
                    checked={this.props.seminarReducer.rateLimiterMode}
                    offColor="#888"
                    onColor="#0b0"
                    checkedIcon={false}
                    uncheckedIcon={false}
                />
            </Container>
        );
    }
}