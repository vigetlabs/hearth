{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = with pkgs; [
    ruby_4_0
    rubyPackages.rails
    tig

    typescript
    typescript-language-server

    nodejs_24

    just
    pre-commit
  ];

  shellHook = ''
    export GEM_HOME="$PWD/.gem"
    export GEM_PATH="$GEM_HOME"
    export PATH="$GEM_HOME/bin:$PATH"
    echo "Entered Viget Project Shell..."
    ruby -v
    node --version
    tsc --version
  '';
}
