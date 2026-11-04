# FERRAZ Connect — Contratos de integração CAD/CAM
**Status:** desenho inicial, não implementação concluída.

## Responsabilidade
Centralizar adaptadores de entrada/saída e integrações externas sem colocar regras geométricas ou comerciais no conector. O domínio e a validação permanecem no `ferraz-core`; a experiência de uso permanece nos módulos consumidores.

## Importação
Formatos em avaliação: PDF, SVG, DXF, imagens, arquivos vetoriais e formatos 3D interoperáveis.
- Preservar arquivo original, hash, nome, MIME type, tamanho, origem, data, usuário, tenant e vínculo ao projeto/ambiente/peça.
- PDF e imagem são fontes de referência; não presumir escala ou medidas.
- Extração assistida deve retornar dados candidatos, confiança, método e localização no documento, exigindo conferência humana.
- Arquivo vetorial pode conter unidade/escala ausente ou ambígua; solicitar calibração e registrar transformação aplicada.
- Validar tipo real, tamanho, malware, limites de processamento e autorização de acesso.
- Nunca executar macros, scripts ou conteúdo ativo recebido em arquivos.

## Exportação
Saídas previstas: PDF de pranchas, SVG/DXF quando tecnicamente suportado, planilhas de quantitativos/comparativos e formatos 3D interoperáveis.
- Toda exportação técnica referencia projeto, peça, revisão, versão do schema e versão do motor.
- PDF técnico deve declarar escala, unidade e revisão; impressão deve preservar escala quando configurada.
- Exportação de planilha deve separar quantitativo líquido, perda calculada, margem adicional e total recomendado; evitar dupla contagem de desperdício.
- Arquivos públicos e privados possuem políticas de acesso diferentes; links privados devem expirar/revogar e exigir autorização.

## Pipeline recomendado
Receber → validar segurança/formato → armazenar original → extrair metadados → converter para formato intermediário → validar unidade/escala → revisão humana → enviar comando ao domínio → registrar resultado → exportar.

## Contrato de processamento
Cada tarefa deve registrar: task_id, tenant_id, actor_id, source_file_id, target_entity_id, format, status, progress, warnings, errors, output_file_ids, engine_version, created_at, completed_at. Operações demoradas devem ser assíncronas, idempotentes e recuperáveis.

## Integrações futuras
Armazenamento por empresa (incluindo Google Drive, se aprovado), serviços OCR/IA e conectores de máquinas devem ser adaptadores substituíveis. Credenciais ficam em armazenamento seguro de servidor, nunca no frontend ou Git.

## Limites
O conector não deve afirmar que um DXF/3D/PDF é fabricável. A validação geométrica, nesting e gate de fabricação pertencem ao core. Compatibilidade CNC exige perfil validado por máquina/controlador e teste físico seguro.
