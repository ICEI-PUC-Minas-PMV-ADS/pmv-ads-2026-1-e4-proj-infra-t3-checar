import React, { useEffect, useState } from 'react';
import './userRegistration.css';

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
    <div className="registration-container">
      <div className="registration-card">
        <form onSubmit={handleSubmit}>
          <h1>Cadastro de Usuários</h1>

          <div className="form-group">
            <label>Nome</label>
            <input
              name='nome'
              type='text'
              placeholder='Insira seu nome'
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name='email'
              type='email'
              placeholder='Insira seu email'
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              name='senha'
              type='password'
              placeholder='Insira sua senha'
              value={formData.senha}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              className="tipo-usuario-select"
            >
              <option value="">Selecione</option>
              <option value="motorista">Motorista</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>

          <button type="submit" className="btn-cadastrar">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}

export default UserRegistration