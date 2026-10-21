# Configuração

## Credenciais

Uma versão anterior publicou uma chave `service_role`. Revogue essa chave no painel do projeto Supabase antes de disponibilizar a aplicação. A remoção do arquivo não revoga a credencial e não apaga o histórico do Git. Revise os acessos e os dados do projeto antigo.

Use um projeto separado para estudo, apenas com dados fictícios. No frontend, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com uma chave publicável ou a chave `anon`. As variáveis `VITE_` são públicas no navegador.

## Banco existente

Faça um backup antes de alterar o banco. Aplique apenas a migração `supabase/migrations/20261021012011_secure_clinic_access.sql` no SQL Editor do Supabase, com uma conta administrativa. Ela adiciona o vínculo com Supabase Auth, substitui as políticas antigas e reativa RLS. Não apaga registros nem migra senhas antigas.

Os scripts de 2025 registram a evolução do trabalho acadêmico. Alguns desabilitam RLS e apagam dados. Não os reaplique em um banco existente.

## Banco novo

Em um projeto Supabase vazio, execute primeiro somente as cinco instruções `CREATE TABLE IF NOT EXISTS` do arquivo `20250627150342_billowing_poetry.sql`, de `users` até `expenses`. Depois, execute a migração de acesso de 2026 citada acima. Não é necessário executar os demais scripts antigos nem cadastrar senhas na tabela `users`.

## Contas

1. Crie as contas de estudo em Authentication > Users no painel do Supabase. Defina senhas próprias; as senhas antigas não são reutilizadas.
2. Para o primeiro administrador, cadastre um perfil em `public.users` pelo Table Editor: `name`, `email`, `role` igual a `admin` e `auth_user_id` igual ao UUID da conta criada em Authentication.
3. Entre no aplicativo com o email e a senha da conta do Supabase Auth.
4. O administrador pode cadastrar os demais perfis na tela Usuários. Crie antes a conta no Supabase Auth e informe seu UUID no perfil. Um perfil sem vínculo não recebe acesso.

As senhas são gerenciadas pelo Supabase Auth, fora da tabela de perfis. Em bancos antigos, a coluna `password` fica inacessível ao cliente; remova os valores antigos após concluir sua transição e seu backup.

Este projeto representa uma única clínica. Administradores, veterinários e auxiliares vinculados compartilham os dados operacionais. Apenas administradores alteram os perfis. Não há isolamento entre várias clínicas.

## Verificação

Os testes verificam autenticação com respostas simuladas e políticas SQL em PostgreSQL embarcado. Não conectam ao banco remoto. Após configurar seu projeto, confira o login, o logout e os cadastros com contas de administrador e auxiliar. Uma conta sem perfil vinculado não deve acessar os dados.
