export enum OrderStatus {
    Requested = "ProcessamentoRequisitado", // Pedido feito pelo client
    Processed = "Processado", // Foi identificada uma matriz que pode atender
    Confirmed = "Confirmado", // Pedido foi confirmado pela matriz
    InPreparation = "EmPreparo", // Preparo do pedido foi confirmado pela matriz
    InTransportation = "EmTransporte", // Pedido saiu para transporte
    Delivered = "Entregue", // Pedido foi entregue e confirmado pela matriz
    NotDelivered = "NaoEntregue", // Pedido não foi entregue pela matriz
    Canceled = "Cancelado"// Pedido foi cancelado
}