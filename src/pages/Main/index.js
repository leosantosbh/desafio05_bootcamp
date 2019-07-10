import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';
import Conteiner from '../../components/Conteiner';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        error: null,
    };

    //carregar dados storage local
    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    //Salvar dados no storage local
    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;

        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value, error: false });
    };

    handleSubmit = async e => {
        e.preventDefault();

        const { newRepo, repositories, error } = this.state;

        try {
            this.setState({ loading: true, error: false });

            if (newRepo === '') throw 'Repositório em branco!';

            const addRepo = repositories.find(add => add.name === newRepo);

            if (addRepo) throw 'Repositório já existe';

            const response = await api.get(`/repos/${newRepo}`);

            const data = {
                name: response.data.full_name,
            };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
            });
        } catch (error) {
            this.setState({ error: true });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { newRepo, repositories, loading, error } = this.state;

        return (
            <Conteiner>
                <h1>
                    <FaGithubAlt />
                    Repositórios
                </h1>
                <Form onSubmit={this.handleSubmit} error={error ? 1 : 0}>
                    <input
                        type="text"
                        placeholder="Adicionar repositório"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading ? 1 : 0}>
                        {loading ? (
                            <FaSpinner color="#fff" size={14}></FaSpinner>
                        ) : (
                            <FaPlus color="#fff" size={14} />
                        )}
                    </SubmitButton>
                </Form>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                detalhes
                            </Link>
                        </li>
                    ))}
                </List>
            </Conteiner>
        );
    }
}
