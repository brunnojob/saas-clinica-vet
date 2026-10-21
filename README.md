# Clínica veterinária

Projeto da faculdade desenvolvido durante o curso de Análise e Desenvolvimento de Sistemas. A proposta era criar um sistema de gestão veterinária para uma atividade acadêmica com estudantes de veterinária.

O projeto foi feito para estudo e apresentação. Não é um sistema validado para uso em uma clínica.

## Funcionalidades

- Cadastro de animais e responsáveis.
- Registro de atendimentos.
- Controle de estoque.
- Registro de gastos.
- Cadastro de perfis da equipe.

Os relatórios usam dados fictícios. A exportação de relatórios e as configurações de notificações, segurança e backup são demonstrações sem implementação.

## Tecnologias

React, TypeScript, Vite, Tailwind CSS, Recharts e Supabase.

## Executar

Requisitos: Node.js 22 e npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com a URL e a chave pública do seu projeto Supabase. Configure o banco e as contas conforme [Configuração](docs/configuracao.md). Nunca use uma chave `service_role` no frontend.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Autor

Brunno Silveira — [brunnodev.store](https://brunnodev.store).

## Licença

[MIT](LICENSE).
