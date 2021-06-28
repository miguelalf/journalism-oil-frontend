import React, { Component } from 'react';
import { Layout, PageHeader, Row, Col, Select, Space, Button } from 'antd';
import ReactApexChart from 'react-apexcharts';

import 'antd/dist/antd.css';
import '../assets/App.css';

import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';

const  { Content, Footer } = Layout;

const { Option } = Select;
const urlApi = 'http://localhost:8000/graph/apiv1/';
const label_petrole = 'Producción de petróleo crudo por activos y región';
const label_methane = 'Elaboración de productos petroquímicos derivados del metano';
const label_price = 'Precio público ponderado de productos petrolíferos seleccionados';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            petroleProduction: [],
            methaneDerivates: [],
            publicPrice: [],
            petroleFields: [],
            methaneFields: [],
            priceFields: [],
            series: [],
            labels: [],
            requested: false,
            loading: false
        }
    }

    handleChangePetrole = e => {
        this.setState({petroleFields: e});
    }

    handleChangeMethane = e => {
        this.setState({methaneFields: e});
    }

    handleChangePrice = e => {
        this.setState({priceFields: e});
    }

    handleSearch = e => {
        this.setState({ loading: true, requested: true });

        const params = {
            fields: this.state.petroleFields.concat(this.state.methaneFields, this.state.priceFields)
        }

        axios.get(urlApi + 'corr/', {params})
        .then(resp => {
            let series = [];
            const response = JSON.parse(resp.data);

            response.index.forEach((val, indx) => {
                series.push({
                    name: val,
                    data: response.data[indx]
                });
            });

            this.setState({ 
                series,
                labels: response.columns,
                loading: false 
            });
        })
        .catch(er => {
            console.log('Error-home-search - ', er);
            this.setState({ loading: false });
        })
    }

    componentDidMount() {
        axios.get(urlApi + 'lists')
        .then(resp => {
            const petroleProduction = resp.data.petrole_production;
            const methaneDerivates = resp.data.methane_derivates;
            const publicPrice = resp.data.public_price;
            
            this.setState({ petroleProduction, methaneDerivates, publicPrice });
        })
        .catch(er => {
            console.log('Error-home-lists - ', er);
        })
    }

    render() {
        const options = {
            chart: {
                height: 350,
                type: 'heatmap',
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#51b94b"],
            title: {
                text: 'Tabla de correlacion'
            },
            xaxis: {
                type: 'data',
                categories: this.state.labels
            },
        }

        return (
            <Layout className="full-height">
                <Content className="content">
                    <PageHeader
                        className="title-marked"
                        title="Consulta de datos"
                        subTitle="[Correlaciones]"
                    />
                    <div className="site-layout-content">
                        <Row>
                            <Col span={8}>
                                <Select
                                    mode='multiple'
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder={label_petrole}
                                    onChange={this.handleChangePetrole}
                                >
                                    {this.state.petroleProduction.map(e => {
                                        return <Option key={e} value={e}>{e}</Option>;
                                    })}
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Select
                                    mode='multiple'
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder={label_methane}
                                    onChange={this.handleChangeMethane}
                                >
                                    {this.state.methaneDerivates.map(e => {
                                        return <Option key={e} value={e}>{e}</Option>;
                                    })}
                                </Select>
                            </Col>
                            <Col span={8}>
                                <Select
                                    mode='multiple'
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder={label_price}
                                    onChange={this.handleChangePrice}
                                >
                                    {this.state.publicPrice.map(e => {
                                        return <Option key={e} value={e}>{e}</Option>;
                                    })}
                                </Select>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center" span={8} offset={8}>
                                <Space style={{padding: '10px 0'}}>
                                    <Button 
                                        type="primary"
                                        shape="round"
                                        icon={<SearchOutlined/>}
                                        onClick={this.handleSearch}
                                        loading={this.state.loading}
                                    >
                                        Buscar Correlación
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div>
                                    {this.state.requested && 
                                        <ReactApexChart 
                                            options={options}
                                            series={this.state.series}
                                            type="heatmap" 
                                            height={500}
                                            width={1000} 
                                        />
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Content>
                <Footer className="text-center">
                    Hidrocarburos de México &copy;2021 miguelalf
                </Footer>
            </Layout>
        );
    }
}