import React, { useEffect, useState } from 'react';

function UserRegistration() {

  const [users, setUsers] = useState([])

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipoUsuario: ''
  })

  async function getUsers() {
    try {
      const response = await fetch('http://localhost:3000/usuariocadastrados')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      await fetch('http://localhost:3000/usuariocadastrados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      alert('Usuário cadastrado com sucesso!')

      getUsers()

      setFormData({
        nome: '',
        email: '',
        senha: '',
        tipoUsuario: ''
      })

    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      alert('Erro ao cadastrar usuário')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro de Usuários</h1>

        <label>Nome</label>
        <br />

        <input
          name='nome'
          type='text'
          placeholder='Insira seu nome'
          value={formData.nome}
          onChange={handleChange}
        />

        <br /><br />

        <label>Email</label>
        <br />

        <input
          name='email'
          type='email'
          placeholder='Insira seu email'
          value={formData.email}
          onChange={handleChange}
        />

        <br /><br />

        <label>Senha</label>
        <br />

        <input
          name='senha'
          type='password'
          placeholder='Insira sua senha'
          value={formData.senha}
          onChange={handleChange}
        />

        <br /><br />

        <label>Tipo de Usuário</label>
        <br />

        <select
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
        >
          <option value="">Selecione</option>
          <option value="motorista">Motorista</option>
          <option value="gestor">Gestor</option>
        </select>

        <br /><br />

        <button type="submit">
          Cadastrar
        </button>
      </form>

      <hr />

      <h2>Usuários cadastrados</h2>

      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.nome}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserRegistration