import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import Dropdown from 'react-dropdown';

import { Loading, Owner, IssueList, Paging } from './styles';
import 'react-dropdown/style.css';
import Conteiner from '../../components/Conteiner';

const options = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abertas' },
    { value: 'closed', label: 'Fechadas' },
];

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }),
    };

    state = {
        repo: {},
        issues: [],
        loading: true,
        selectedOption: 'Todos',
        page: 1,
    };

    handleChange = async selectedOption => {
        await this.setState({ selectedOption: selectedOption });
        await this.setState({ page:1});
        this.carregaNovo();
    };

    handlePage = async action => {
        const { page } = this.state;
        await this.setState({ page: action === 'back' ? page - 1 : page + 1 });
        this.carregaNovo();
    };

    async carregaNovo() {
        const { match } = this.props;

        const { page, selectedOption } = this.state;

        const repoName = decodeURIComponent(match.params.repository);

        const { value } = selectedOption;

        const [repo, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: value,
                    per_page: 5,
                    page: page,
                },
            }),
        ]);

        this.setState({ repo: repo.data, issues: issues.data, loading: false });
    }

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repo, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'all',
                    per_page: 5,
                },
            }),
        ]);

        this.setState({ repo: repo.data, issues: issues.data, loading: false });
    }

    render() {
        const { repo, issues, loading, selectedOption, page } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Conteiner>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img src={repo.owner.avatar_url} alt={repo.owner.login} />
                    <h1>{repo.name}</h1>
                    <p>{repo.description}</p>
                </Owner>

                <Dropdown
                    options={options}
                    onChange={this.handleChange}
                    value={selectedOption}
                    placeholder="Selecione uma Opção"
                />

                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
                <Paging>
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => this.handlePage('back')}
                    >
                        Prev
                    </button>
                    <span>Pagina {page}</span>
                    <button
                        type="button"
                        onClick={() => this.handlePage('next')}
                    >
                        Next
                    </button>
                </Paging>
            </Conteiner>
        );
    }
}
