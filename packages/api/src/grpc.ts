export interface GRPCServiceDefinition {
  serviceName: string;
  methods: Array<{
    name: string;
    requestType: string;
    responseType: string;
  }>;
}

export const LithoGRPCService: GRPCServiceDefinition = {
  serviceName: "lithomind.v1.AgentService",
  methods: [
    { name: "RunOPC", requestType: "RunOPCRequest", responseType: "RunOPCResponse" },
    { name: "GetPDK", requestType: "GetPDKRequest", responseType: "GetPDKResponse" },
    { name: "InvestigateRCA", requestType: "RCARequest", responseType: "RCAResponse" },
  ],
};
