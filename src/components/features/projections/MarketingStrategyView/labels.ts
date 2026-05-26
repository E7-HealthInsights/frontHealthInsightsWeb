import type { ChannelTipo, TacticaTipo, Tono } from '../../../../types/MarketingStrategy'

export const CHANNEL_LABEL: Record<ChannelTipo, string> = {
  digital:     'Digital',
  ooh:         'Exterior / OOH',
  radio:       'Radio',
  tv:          'Televisión',
  comunitario: 'Comunitario',
  prensa:      'Prensa',
  salud:       'Centros de salud',
  messaging:   'Mensajería',
}

export const CHANNEL_DESCRIPTION: Record<ChannelTipo, string> = {
  digital:     'Plataformas web, redes sociales, anuncios en línea',
  ooh:         'Anuncios fuera de casa: espectaculares, parabuses, vallas',
  radio:       'Estaciones de radio AM/FM, locales y regionales',
  tv:          'Televisión abierta o por cable',
  comunitario: 'Eventos en colonias, comités vecinales, ferias',
  prensa:      'Periódicos, revistas, medios impresos',
  salud:       'Clínicas, hospitales y módulos de salud',
  messaging:   'SMS y WhatsApp Business directos al usuario',
}

export const TACTICA_LABEL: Record<TacticaTipo, string> = {
  espectacular: 'Espectacular',
  red_social:   'Redes sociales',
  radio:        'Radio',
  tv:           'TV',
  volantes:     'Volantes',
  evento:       'Evento presencial',
  salud:        'Punto de salud',
  influencer:   'Influencer',
  sms_whatsapp: 'SMS / WhatsApp',
  prensa:       'Prensa',
  podcast:      'Podcast',
  email:        'Email',
}

export const TONO_LABEL: Record<Tono, string> = {
  educativo:     'Educativo',
  urgente:       'Urgente',
  esperanzador:  'Esperanzador',
  motivacional: 'Motivacional',
}

export const CHANNEL_ORDER: ChannelTipo[] = [
  'salud', 'comunitario', 'radio', 'tv', 'ooh', 'digital', 'messaging', 'prensa',
]
