export const mockedStudents = [
  // Série 5A
  { id: "1", nome: "Pedro Gael", serie: "5A" },
  { id: "2", nome: "Maria Santos", serie: "5A" },
  { id: "3", nome: "Pedro Oliveira", serie: "5A" },
  { id: "4", nome: "Ana Costa", serie: "5A" },
  { id: "5", nome: "Carlos Ferreira", serie: "5A" },

  // Série 5B
  { id: "6", nome: "Samuel Levi", serie: "5B" },
  { id: "7", nome: "Juliana Rocha", serie: "5B" },
  { id: "8", nome: "Felipe Torres", serie: "5B" },
  { id: "9", nome: "Beatriz Alves", serie: "5B" },
  { id: "10", nome: "Gustavo Ribeiro", serie: "5B" },

  // Série 6A
  { id: "11", nome: "Rázylla Silva", serie: "6A" },
  { id: "12", nome: "Rafael Pereira", serie: "6A" },
  { id: "13", nome: "Sophia Gomes", serie: "6A" },
  { id: "14", nome: "Matheus Dias", serie: "6A" },
  { id: "15", nome: "Carolina Souza", serie: "6A" },

  // Série 6B
  { id: "16", nome: "Acsa Sofia", serie: "6B" },
  { id: "17", nome: "Fernanda Lima", serie: "6B" },
  { id: "18", nome: "Henrique Monteiro", serie: "6B" },
  { id: "19", nome: "Victória Nunes", serie: "6B" },
  { id: "20", nome: "Bruno Costa", serie: "6B" },

  // Série 7A
  { id: "21", nome: "Dorivaldo Miguel", serie: "7A" },
  { id: "22", nome: "Vitor Cardoso", serie: "7A" },
  { id: "23", nome: "Gabriela Pinto", serie: "7A" },
  { id: "24", nome: "Diego Melo", serie: "7A" },
  { id: "25", nome: "Laura Ribeiro", serie: "7A" },

  // Série 7B
  { id: "26", nome: "Antonio Pereira", serie: "7B" },
  { id: "27", nome: "Camila Freitas", serie: "7B" },
  { id: "28", nome: "Leandro Silva", serie: "7B" },
  { id: "29", nome: "Natalia Campos", serie: "7B" },
  { id: "30", nome: "Roberto Alves", serie: "7B" },
];

export function agruparPorSerie(students) {
  const agrupado = {};
  students.forEach(student => {
    if (!agrupado[student.serie]) {
      agrupado[student.serie] = [];
    }
    agrupado[student.serie].push(student);
  });
  return agrupado;
}
