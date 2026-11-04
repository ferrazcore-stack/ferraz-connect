# FERRAZ Connect — contrato de integração

Status: proposta de arquitetura; adaptadores ainda dependem de requisitos e credenciais autorizadas.

## Responsabilidade
Conter adaptadores externos e formatos de intercâmbio, sem concentrar regras geométricas ou lógica visual do aplicativo.

## Integrações candidatas
- Importação/exportação de projetos e listas de peças.
- Adaptadores CAD/CAM e formatos de desenho, definidos por requisitos reais.
- Exportação CNC somente após definir máquinas, controladores, pós-processadores, ferramentas, materiais e parâmetros.
- Integração com fornecedores e marmorarias por cadastro/API/importação, conforme disponibilidade.

## Contrato dos adaptadores
- Entrada e saída validadas por schema versionado.
- Normalização de unidades e identificadores.
- Idempotência para operações repetíveis.
- Timeouts, retentativas limitadas e logs sem segredos.
- Segredos em cofre/variáveis de servidor, nunca no cliente.
- Erros externos convertidos para tipos de erro estáveis.

## Segurança CNC
Nenhum adaptador pode transmitir ou executar programa de máquina por padrão. Qualquer fluxo futuro exige pós-processador específico, simulação, validação de limites e ferramentas, revisão humana, confirmação explícita e trilha de auditoria.

## Critérios de aceite
Cada integração deve ter documentação de versão, exemplos de entrada/saída, testes com fixtures, tratamento de falhas e ambiente de homologação. Não declarar integração pronta apenas por existir um tipo ou botão na interface.
