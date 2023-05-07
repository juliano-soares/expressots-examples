interface IFindbyidUserRequestDTO {
    id: string;
}

interface IFindbyidUserResponseDTO {
    id: string;
    name: string;
    email: string;
}

export { IFindbyidUserRequestDTO, IFindbyidUserResponseDTO };
