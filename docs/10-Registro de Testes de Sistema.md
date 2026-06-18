# Testes de Sistema no Backend

## O que são Testes de Sistema?

Testes de sistema são testes automatizados que verificam o comportamento completo de um sistema, validando que ele funciona conforme esperado em um ambiente real ou próximo do real. Eles englobam a verificação de todas as funcionalidades do sistema, desde a interface do usuário até a integração com bancos de dados, APIs externas e outros serviços.

## Por que são Importantes?

Testes de sistema ajudam a:

- Garantir que o sistema como um todo atende aos requisitos especificados.
- Identificar problemas que surgem em interações complexas entre componentes.
- Validar a funcionalidade completa em um ambiente que simula o uso real.
- Garantir que as mudanças no código não causem regressões em áreas não diretamente relacionadas.

## Requisitos Funcionais:

RF 001 - Permitir o cadastro e autenticação de motoristas e gestores

|RF-002	Permitir o cadastro detalhado de veículos (placa, modelo, ano)| Evidência| Descrição do teste
Preenchimento das informações do carro
<img width="1536" height="606" alt="image" src="https://github.com/user-attachments/assets/56fefa62-9c01-44c5-a480-74a0df60cf76" />
Upload das fotos para identificar as condições do carro:
<img width="1208" height="895" alt="image" src="https://github.com/user-attachments/assets/80e40f14-424e-47df-9a37-8f753612727c" />
Cadastro feito com sucesso
<img width="875" height="490" alt="image" src="https://github.com/user-attachments/assets/3370fd74-55b9-41d8-8107-d349abb8a06b" />|

RF-003	Permitir a criação de modelos de checklist (diário, preventivo)
Preenchimento de Informações, ao lado aparece todos os dados do checklist de acordo com o preenchimento
<img width="1396" height="888" alt="image" src="https://github.com/user-attachments/assets/96dfac47-8ed3-4a5a-98de-440ea7afcb06" />
Composição do CheckList
<img width="750" height="811" alt="image" src="https://github.com/user-attachments/assets/f162d1a8-9c46-4e54-8cb0-97d0446dfbd2" />
Após a composição do itens necessários para realizar no checklist
<img width="1182" height="181" alt="image" src="https://github.com/user-attachments/assets/7dc62e5e-712f-4c2e-bda3-7aea8a426cf7" />

RF-004	Registrar status de itens (Conforme/Não Conforme)
Em Veículos clico em Iniciar CheckList
<img width="1481" height="472" alt="image" src="https://github.com/user-attachments/assets/cf4b79f2-c05e-411f-91b2-e7c4ee92c903" />
Seleciono o checklist disponível
<img width="1168" height="151" alt="image" src="https://github.com/user-attachments/assets/56bd5b16-511c-4283-aa31-b1e7ae61813f" />
Seleciono conforme ou não conforme e após isso vou em salvar
<img width="1313" height="852" alt="image" src="https://github.com/user-attachments/assets/02e268b5-5bc6-466c-bf21-6e0e5bd7d369" />
Checklist salvo com sucesso
<img width="1445" height="495" alt="image" src="https://github.com/user-attachments/assets/53bedf32-d058-4d8e-b9ec-3513e6a7838b" />

RF-005	Permitir upload de fotos de avarias nos veículos	
RF-006	Permitir a inclusão de observações em texto livre por item	
RF-007	Permitir a assinatura digital do condutor ao finalizar
Após fazer o checklist pelo motorista o mesmo deve assinar para garantir rastreabilidade
<img width="748" height="573" alt="image" src="https://github.com/user-attachments/assets/9e9f7ef8-0e9b-4b84-acdc-3f09cf352bb1" />
RF-008	Calcular automaticamente a conformidade do checklist		
RF-009	Gerar relatórios em PDF das inspeções realizadas		
RF-010	Enviar notificações de falhas críticas via sistema		
RF-011	Permitir a busca de histórico de inspeções por placa	   
RF-012	Permitir a exportação de dados em formato CSV	
RF-013	Permitir realizar login
