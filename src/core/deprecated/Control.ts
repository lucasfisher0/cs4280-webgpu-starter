

/*
EXAMPLE SNIPPET

interface $NAME$Props {
    $END$
}

export const $NAME$: React.FC<$NAME$Props> = ({ }) => {
    return (
        <div>
            $NAME$
        </div>
    );
};
 */

export class Control {
  // 1. Field Declarations
  id: number;
  name: string;

  // 2. Constructor
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // 3. Method
  greet(): string {
    return `Hello, my name is ${this.name}.`;
  }
}

export function GetControlName(control: Control): string {
  return control.name;
}
