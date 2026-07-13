class Api::V1::Offices::OfficesController < ApplicationController
  include ApiResponse

  def index
    offices = Office.order(:name)

    serialized_offices = offices.map do |office|
      {
        id: office.id,
        name: office.name,
        city: office.city,
        state: office.state,
        timezone: office.timezone,
        emoji: office.emoji
      }
    end

    data = { offices: serialized_offices }

    success_response(
      data: data,
      message: "Fetched offices successfully",
    )
  end
end
