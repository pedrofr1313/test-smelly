const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suíte de Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('Criação de usuários', () => {
    test('deve criar um usuário com dados válidos', () => {
      // Arrange
      const { nome, email, idade } = dadosUsuarioPadrao;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado).toBeDefined();
      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao tentar criar usuário menor de idade', () => {
      // Arrange
      const nome = 'Menor';
      const email = 'menor@email.com';
      const idadeMenor = 17;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idadeMenor);
      }).toThrow('O usuário deve ser maior de idade.');
    });

    test('deve criar usuário administrador quando especificado', () => {
      // Arrange
      const nome = 'Admin';
      const email = 'admin@teste.com';
      const idade = 40;
      const isAdmin = true;

      // Act
      const usuarioAdmin = userService.createUser(nome, email, idade, isAdmin);

      // Assert
      expect(usuarioAdmin.isAdmin).toBe(true);
    });
  });

  describe('Busca de usuários', () => {
    test('deve buscar um usuário existente pelo ID', () => {
      // Arrange
      const usuarioCriado = userService.createUser(
        dadosUsuarioPadrao.nome,
        dadosUsuarioPadrao.email,
        dadosUsuarioPadrao.idade
      );

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toBeDefined();
      expect(usuarioBuscado.id).toBe(usuarioCriado.id);
      expect(usuarioBuscado.nome).toBe(dadosUsuarioPadrao.nome);
      expect(usuarioBuscado.email).toBe(dadosUsuarioPadrao.email);
      expect(usuarioBuscado.status).toBe('ativo');
    });

    test('deve retornar lista vazia quando não há usuários cadastrados', () => {
      // Arrange - banco já está limpo pelo beforeEach

      // Act
      const usuarios = userService.getAllUsers();

      // Assert
      expect(usuarios).toBeDefined();
      expect(usuarios).toHaveLength(0);
    });
  });

  describe('Desativação de usuários', () => {
    test('deve desativar usuário comum com sucesso', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve impedir desativação de usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });
  });

  describe('Geração de relatórios', () => {
    test('deve gerar relatório contendo todos os usuários cadastrados', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('alice@email.com');
      expect(relatorio).toContain('bob@email.com');
    });

    test('deve incluir cabeçalho no relatório de usuários', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Relatório de Usuários');
    });

    test('deve mostrar status correto dos usuários no relatório', () => {
      // Arrange
      const usuarioAtivo = userService.createUser('Alice', 'alice@email.com', 28);
      const usuarioInativo = userService.createUser('Bob', 'bob@email.com', 32);
      userService.deactivateUser(usuarioInativo.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('ativo');
      expect(relatorio).toContain('inativo');
    });
  });
});