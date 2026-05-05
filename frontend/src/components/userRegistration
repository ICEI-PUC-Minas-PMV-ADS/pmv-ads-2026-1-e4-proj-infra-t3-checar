import React from 'react';
import { useEffect, useState } from 'react'

function Home() {

  const [users, setUsers] = useState([])

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipoUsuario: ''
  })

  async function getUsers() {
    try {
      const response = await api.get('/usuarios')
      setUsers(response.data)
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

    console.log('Enviando dados:', formData)

    try {
      await api.post('/usuarios', formData)

      alert('Usuário cadastrado!')

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
    <div className='container'>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro de Usuários</h1>

        <label>Nome</label>
        <input 
          name='nome' 
          type='text' 
          placeholder='Insira seu nome'
          value={formData.nome}
          onChange={handleChange}
        />

        <label>Email</label>
        <input 
          name='email' 
          type='email' 
          placeholder='Insira seu email'
          value={formData.email}
          onChange={handleChange}
        />

        <label>Senha</label>
        <input 
          name='senha' 
          type='password' 
          placeholder='Insira sua senha'
          value={formData.senha}
          onChange={handleChange}
        />

        <label>Tipo de Usuário</label>
        <select 
          name="tipoUsuario"
          value={formData.tipoUsuario}
          onChange={handleChange}
        >
          <option value="">Selecione</option>
          <option value="motorista">Motorista</option>
          <option value="gestor">Gestor</option>
        </select>

        <button type="submit">Cadastrar</button>
      </form>

      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.nome}</li>
        ))}
      </ul>
    </div>
  )
}

export default Home