# typed: strict

module ApplicationCable
  module Types
    ChannelData = T.type_alias do
      T::Hash[String, T.untyped]
    end
  end
end
